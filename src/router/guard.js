// 방 복귀를 시도해야 하는가. 미인증이면(잔재 정리 대상) false.
export function shouldReturnToRoom(isLoggedIn, savedRoomId, toPath) {
  return Boolean(isLoggedIn && savedRoomId && toPath !== `/room/${savedRoomId}`);
}
