<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composable/useToast';
import { createRoom, joinRoom, fetchRooms } from '@/api/rooms';
import Card from '@/components/RoomListCard.vue';
import Modal from '@/components/ModalComp.vue';

const { show } = useToast();

const room = ref(null);
const roomList = ref([]);
const isLoading = ref(false);
const showModal = ref(false);
const roomName = ref(null);
const roomPassword = ref('');
const isPrivate = ref(false);
const showPasswordModal = ref(false);
const passwordInput = ref('');
const pendingRoomId = ref(null);

const playerStore = usePlayerStore();
const player = { id: playerStore.playerId, name: playerStore.username };

const router = useRouter();

const authStore = useAuthStore();
const displayName = computed(() => authStore.nickname ?? '손님');
const isGuest = computed(() => authStore.role === 'GUEST');

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

async function createRoomAndConnect() {
  if (roomName.value == null || roomName.value.trim().length < 2) {
    show('방 이름은 2글자 이상이어야 합니다', 'error', 1000);
    return;
  }
  if (isPrivate.value && !roomPassword.value.trim()) {
    show('비밀번호를 입력해주세요', 'error', 1000);
    return;
  }
  try {
    const params = { title: roomName.value };
    if (roomPassword.value.trim()) params.password = roomPassword.value.trim();
    const res = await createRoom(params);
    if (res.status !== 200) throw new Error('Failed to create room');
    room.value = res.data;
    const joinRes = await joinRoom(room.value, player,
      roomPassword.value.trim() ? { password: roomPassword.value.trim() } : {}
    );
    if (joinRes.status !== 200) throw new Error('Failed to join room');
    router.push({ name: 'Room', params: { roomNo: room.value } });
  } catch (error) {
    console.error(error);
  }
}

function requestJoin(roomItem) {
  if (roomItem.hasPassword) {
    pendingRoomId.value = roomItem.roomId;
    passwordInput.value = '';
    showPasswordModal.value = true;
  } else {
    joinRoomAndConnect(roomItem.roomId, '');
  }
}

async function confirmPasswordAndJoin() {
  await joinRoomAndConnect(pendingRoomId.value, passwordInput.value);
}

async function joinRoomAndConnect(roomId, password) {
  try {
    room.value = roomId;
    const params = password ? { password } : {};
    const joinRes = await joinRoom(roomId, player, params);
    if (joinRes.status !== 200) throw new Error('Failed to join room');
    showPasswordModal.value = false;
    router.push({ name: 'Room', params: { roomNo: room.value } });
  } catch (error) {
    if (error.response?.status === 403) {
      show('비밀번호가 틀렸습니다', 'error', 1500);
    } else {
      console.error(error);
    }
  }
}

const fetchRoomList = async () => {
  try {
    isLoading.value = true;
    const res = await fetchRooms();
    roomList.value = res.data;
  } catch (error) {
    console.error('방 목록 로딩 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchRoomList);
</script>

<template>
  <div class="lobby">

    <div class="user-bar">
      <span class="user-name">
        <span class="user-dot" :class="isGuest ? 'guest' : 'member'"></span>
        {{ displayName }}
        <span class="user-role">{{ isGuest ? '게스트' : '회원' }}</span>
      </span>
      <span class="bar-actions">
        <button v-if="!isGuest" class="btn kifu-btn" @click="router.push('/games')">내 기보</button>
        <button class="btn logout-btn" @click="handleLogout">로그아웃</button>
      </span>
    </div>

    <div class="lobby-main">
    <header class="lobby-header">
      <h1 class="lobby-title">대 국 실</h1>
      <p class="lobby-sub">흑과 백이 겨루는 오목 대국실입니다</p>
    </header>

    <div class="room-panel">
      <div class="panel-toolbar">
        <span class="panel-label">현재 대국 목록</span>
        <div class="toolbar-actions">
          <button class="btn refresh-btn" @click="fetchRoomList">↻ 새로고침</button>
          <button class="create-plaque" @click="showModal = true">
            <span class="create-icon">＋</span>대국방 개설
          </button>
        </div>
      </div>

      <div class="room-list">
        <div v-if="isLoading" class="empty-state">불러오는 중…</div>

        <div v-else-if="roomList.length === 0" class="empty-state">
          <span class="empty-icon">⊙</span>
          <p>현재 개설된 대국방이 없습니다</p>
          <p class="empty-hint">상단 개설 버튼으로 대국방을 만들어보세요</p>
        </div>

        <div v-else class="flex dir-col">
          <Card
            v-for="room in roomList"
            :key="room.roomId"
            :title="room.title"
            :personnel="room.players.length"
            :hasPassword="room.hasPassword"
          >
            <button
              @click="requestJoin(room)"
              :disabled="room.players.length >= 2"
              class="btn join-btn"
            >
              입 장
            </button>
          </Card>
        </div>
      </div>
    </div>
    </div>

    <!-- 방 만들기 모달 -->
    <Modal
      :visible="showModal"
      @close="showModal = false; roomPassword = ''; isPrivate = false"
      :headerContent="'대국방 개설'"
      :applyContent="'개설하기'"
      :applyFunction="createRoomAndConnect"
    >
      <div class="modal-field">
        <label for="room-name">대국방 이름</label>
        <input type="text" id="room-name" v-model="roomName" placeholder="두 글자 이상 입력" />
      </div>
      <div class="modal-toggle">
        <button
          class="toggle-btn"
          :class="{ active: !isPrivate }"
          @click="isPrivate = false; roomPassword = ''"
        >공개</button>
        <button
          class="toggle-btn"
          :class="{ active: isPrivate }"
          @click="isPrivate = true"
        >비공개</button>
      </div>
      <div class="modal-field" v-if="isPrivate">
        <label for="room-password">비밀번호</label>
        <input type="password" id="room-password" v-model="roomPassword" placeholder="비밀번호를 입력하세요" />
      </div>
    </Modal>

    <!-- 비밀방 입장 모달 -->
    <Modal
      :visible="showPasswordModal"
      @close="showPasswordModal = false"
      :headerContent="'비밀번호 입력'"
      :applyContent="'입장하기'"
      applyVariant="join"
      :applyFunction="confirmPasswordAndJoin"
    >
      <div class="modal-field">
        <label for="join-password">비밀번호</label>
        <input
          type="password"
          id="join-password"
          v-model="passwordInput"
          placeholder="비밀번호를 입력하세요"
          @keyup.enter="confirmPasswordAndJoin"
        />
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.lobby {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 3rem;
  min-height: 100svh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 유저바 아래 남는 공간에 헤더+목록을 세로 중앙 배치 */
.lobby-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 3rem;
}

/* 유저 바 */
.user-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.4rem;
}

.user-name {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--inkColor);
  letter-spacing: 0.03em;
}

.user-dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-dot.member {
  background: radial-gradient(circle at 35% 35%, #666, #111);
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
}

.user-dot.guest {
  background: radial-gradient(circle at 35% 35%, #fff, #bbb);
  border: 1px solid #aaa;
}

.user-role {
  font-size: 0.72rem;
  color: var(--inkMid);
  opacity: 0.75;
}

.bar-actions {
  display: flex;
  gap: 0.5rem;
}

.logout-btn,
.kifu-btn {
  font-size: 0.78rem;
  padding: 4px 12px;
  margin: 0;
}

/* 헤더 */
.lobby-header {
  text-align: center;
  margin-bottom: 2.4rem;
}

.lobby-title {
  font-family: 'ChosunGs', serif;
  font-size: 2.4rem;
  color: var(--inkColor);
  letter-spacing: 0.45em;
  margin: 0 0 0.4rem;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.4);
}

.lobby-sub {
  font-size: 0.8rem;
  color: var(--inkMid);
  letter-spacing: 0.05em;
  margin: 0;
}

/* 방 목록 패널 */
.room-panel {
  background: rgba(255,255,255,0.18);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(44,21,5,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
  overflow: hidden;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1.2rem;
  background: linear-gradient(180deg, rgba(201,160,71,0.25) 0%, rgba(201,160,71,0.08) 100%);
  border-bottom: 1px solid var(--borderColor);
}

.panel-label {
  font-size: 0.8rem;
  font-family: 'ChosunGs', serif;
  color: var(--inkMid);
  letter-spacing: 0.1em;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn {
  font-size: 0.82rem;
  padding: 6px 16px;
  margin: 0;
}

.room-list {
  padding: 1.25rem;
  min-height: 300px;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--inkMid);
  font-size: 0.88rem;
}

.empty-icon {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.4;
}

.empty-hint {
  font-size: 0.78rem;
  opacity: 0.6;
  margin-top: 0.3rem;
}

/* 입장 버튼 */
.join-btn {
  font-family: 'ChosunGs', serif;
  letter-spacing: 0.2em;
  font-size: 0.85rem;
  padding: 6px 16px;
  white-space: nowrap;
  color: #f3ecd6;
  background: linear-gradient(180deg, rgba(154, 68, 54, 0.85) 0%, rgba(122, 47, 36, 0.88) 100%);
  box-shadow: 0 1px 2px rgba(80, 30, 22, 0.24);
}

.join-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, rgba(168, 80, 64, 0.92) 0%, rgba(136, 56, 44, 0.94) 100%);
  color: #f3ecd6;
}

/* 방 개설 명패 버튼 (군청 강조) */
.create-plaque {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: var(--app-font);
  letter-spacing: 0.04em;
  color: #f3ecd6;
  background: linear-gradient(180deg, rgba(63, 81, 112, 0.82) 0%, rgba(43, 58, 85, 0.86) 100%);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
  box-shadow: 0 2px 5px rgba(30, 40, 60, 0.24);
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.create-plaque:hover {
  background: linear-gradient(180deg, rgba(78, 98, 132, 0.9) 0%, rgba(54, 72, 102, 0.92) 100%);
}

.create-plaque:active {
  transform: translateY(0.5px);
  box-shadow: inset 0 1px 3px rgba(20, 40, 34, 0.4);
}

.create-icon {
  font-size: 1.05rem;
  line-height: 1;
}

/* 모달 필드 */
.modal-field {
  margin-bottom: 0.5rem;
}

.modal-field label {
  display: block;
  font-size: 0.82rem;
  color: var(--inkMid);
  margin-bottom: 0.4rem;
  letter-spacing: 0.04em;
}

.modal-field input {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--borderColor);
  border-radius: 2px;
  font-size: 0.9rem;
  font-family: var(--app-font);
  background: rgba(255,255,255,0.75);
  color: var(--inkColor);
  box-sizing: border-box;
}

.modal-field input:focus {
  outline: none;
  border-color: var(--mainColor);
  box-shadow: 0 0 0 2px rgba(92,46,14,0.15);
}

.modal-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 0.75rem;
  border: 1px solid var(--borderColor);
  border-radius: 2px;
  overflow: hidden;
}

.toggle-btn {
  flex: 1;
  padding: 0.45rem 0;
  font-size: 0.85rem;
  font-family: 'ChosunGs', serif;
  letter-spacing: 0.08em;
  background: transparent;
  border: none;
  color: var(--inkMid);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.toggle-btn.active {
  background: var(--mainColor);
  color: #f5e9ce;
  font-weight: 600;
}

.toggle-btn:not(.active):hover {
  background: rgba(92,46,14,0.06);
}
</style>
