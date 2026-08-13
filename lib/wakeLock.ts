// iOS 16.4+/최신 브라우저에서 지원하는 Screen Wake Lock API 래퍼.
// 타이머가 도는 동안 화면이 자동으로 꺼지지 않게 붙잡아둔다.
// 미지원 브라우저에서는 조용히 아무 동작도 하지 않는다.
export class ScreenWakeLock {
  private sentinel: WakeLockSentinel | null = null;

  async request() {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    if (this.sentinel) return;

    try {
      this.sentinel = await navigator.wakeLock.request("screen");

      // 브라우저가 자체적으로(탭이 백그라운드로 갈 때 등) lock을 해제하는 경우가 있어
      // 참조를 정리해둔다. 다시 화면이 보일 때 재요청은 호출부에서 처리한다.
      this.sentinel.addEventListener("release", () => {
        this.sentinel = null;
      });
    } catch {
      // 사용자가 거부했거나 미지원 — 무시
    }
  }

  release() {
    this.sentinel?.release().catch(() => {});
    this.sentinel = null;
  }
}
