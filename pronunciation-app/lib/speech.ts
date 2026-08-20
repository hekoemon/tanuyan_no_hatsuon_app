// Web Speech API（音声認識・音声合成）をあつかうユーティリティ。
// ブラウザにしか存在しないAPIなので、TypeScript用に型を自分で定義しています。

export interface SpeechRecognitionResultData {
  transcript: string;
  confidence: number;
  durationMs: number;
}

// Chrome / Edge は SpeechRecognition を webkitSpeechRecognition という名前で提供している
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as IWindow;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window;
}

/**
 * マイクから音声を1回だけ認識する。
 * onResult: 認識が成功したときに呼ばれる
 * onError: 認識が失敗した・音声が聞き取れなかったときに呼ばれる
 * onStart / onEnd: 録音の開始・終了を画面に伝えるためのコールバック
 * 戻り値の関数を呼ぶと録音を途中で止められる（stop関数）
 */
export function startSpeechRecognition(options: {
  onResult: (result: SpeechRecognitionResultData) => void;
  onError: (message: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}): { stop: () => void } {
  const w = window as IWindow;
  const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

  if (!SpeechRecognitionCtor) {
    options.onError(
      "このブラウザは音声にんしきに対応していません。Google Chromeをお使いください。"
    );
    return { stop: () => {} };
  }

  const recognition = new SpeechRecognitionCtor();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  let startTime = 0;
  let finished = false;

  recognition.onstart = () => {
    startTime = Date.now();
    options.onStart?.();
  };

  recognition.onresult = (event: any) => {
    finished = true;
    const result = event.results[0][0];
    const durationMs = Date.now() - startTime;
    options.onResult({
      transcript: result.transcript || "",
      confidence: typeof result.confidence === "number" ? result.confidence : 0.75,
      durationMs,
    });
  };

  recognition.onerror = (event: any) => {
    finished = true;
    if (event.error === "no-speech") {
      options.onError("声が聞こえませんでした。もう一度マイクに向かって話してください。");
    } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      options.onError("マイクの使用が許可されていません。ブラウザの設定を確認してください。");
    } else {
      options.onError("音声にんしきでエラーが起きました。もう一度ためしてください。");
    }
  };

  recognition.onend = () => {
    // Safari は「結果もエラーもなく」録音が終わることがある（無音のまま時間切れ等）。
    // その場合はここでエラー扱いにして、画面が固まらないようにする。
    if (!finished) {
      finished = true;
      options.onError("声が聞こえませんでした。もう一度マイクに向かって話してください。");
    }
    options.onEnd?.();
  };

  try {
    recognition.start();
  } catch (e) {
    options.onError("録音を開始できませんでした。もう一度ためしてください。");
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {
        // すでに停止している場合は何もしない
      }
    },
  };
}

/**
 * 模範音声を読み上げる（SpeechSynthesis API）
 *
 * 注意（Safari対応）：
 * Safari（特にiOS）は起動直後 getVoices() が空配列を返すことがある。
 * その場合は "voiceschanged" イベントを待ってから読み上げる。
 * また iOS Safari は「ボタンをタップした直後の同期処理」でないと
 * 発話がキャンセルされることがあるため、speak() 自体は必ずタップの
 * イベントハンドラの中から同期的に呼び出すこと（このため非同期waitはしない）。
 */
export function speakText(text: string, rate: number = 0.9): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel(); // 前の読み上げが残っていたら止める

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const englishVoice =
      voices.find((v) => v.lang === "en-US") || voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) utterance.voice = englishVoice;
    window.speechSynthesis.speak(utterance);
  } else {
    // 声のリストがまだ読み込まれていない（Safariでよく起こる）。
    // 読み込まれ次第、声を選び直してから発話する。
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.onvoiceschanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      const englishVoice =
        loadedVoices.find((v) => v.lang === "en-US") ||
        loadedVoices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) {
        // 直前の発話がまだ声なしで再生されていなければ、声を指定して再発話
        window.speechSynthesis.cancel();
        const retryUtterance = new SpeechSynthesisUtterance(text);
        retryUtterance.lang = "en-US";
        retryUtterance.rate = rate;
        retryUtterance.pitch = 1.0;
        retryUtterance.voice = englishVoice;
        window.speechSynthesis.speak(retryUtterance);
      }
    };
  }
}

/**
 * ページ読み込み時に一度呼んでおくと、Safariでの声リスト読み込みが早まる。
 * app/page.tsx などで useEffect の中から1回呼び出す想定。
 */
export function warmUpVoices(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.getVoices();
}
