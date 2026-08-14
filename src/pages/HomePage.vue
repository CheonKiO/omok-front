<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useServerStore } from '@/stores/server';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composable/useToast';
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
const server = useServerStore();

const authStore = useAuthStore();
const displayName = computed(() => authStore.nickname ?? '손님');
const isGuest = computed(() => authStore.role === 'GUEST');

function handleLogout() {
  authStore.logout();
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
    const res = await axios.post(`${server.BASEURL}/api/rooms/create`, null, { params });
    if (res.status !== 200) throw new Error('Failed to create room');
    room.value = res.data;
    const joinRes = await axios.post(`${server.BASEURL}/api/rooms/join/${room.value}`, player,
      { params: roomPassword.value.trim() ? { password: roomPassword.value.trim() } : {} }
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
    const joinRes = await axios.post(`${server.BASEURL}/api/rooms/join/${roomId}`, player, { params });
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
    const res = await axios.get(`${server.BASEURL}/api/rooms`);
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
      <button class="btn logout-btn" @click="handleLogout">로그아웃</button>
    </div>

    <header class="lobby-header">
      <h1 class="lobby-title">대 국 실</h1>
      <p class="lobby-sub">흑과 백이 겨루는 오목 대국실입니다</p>
    </header>

    <div class="room-panel">
      <div class="panel-toolbar">
        <span class="panel-label">현재 대국 목록</span>
        <button class="btn refresh-btn" @click="fetchRoomList">↻ 새로고침</button>
      </div>

      <div class="room-list">
        <div v-if="isLoading" class="empty-state">불러오는 중…</div>

        <div v-else-if="roomList.length === 0" class="empty-state">
          <span class="empty-icon">⊙</span>
          <p>현재 개설된 대국방이 없습니다</p>
          <p class="empty-hint">아래 버튼으로 대국방을 만들어보세요</p>
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

    <!-- 방 만들기 버튼 -->
    <button @click="showModal = true" class="create-btn" title="대국방 만들기">
      <span class="create-icon">＋</span>
    </button>

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
  max-width: 640px;
  margin: 0 auto;
  padding: 3rem 1.5rem 6rem;
  min-height: 100svh;
  box-sizing: border-box;
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

.logout-btn {
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

.refresh-btn {
  font-size: 0.8rem;
  padding: 4px 12px;
  margin: 0;
}

.room-list {
  padding: 1rem;
  min-height: 120px;
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
}

/* 방 만들기 플로팅 버튼 */
.create-btn {
  position: fixed;
  bottom: 2.5rem;
  right: 2.5rem;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--inkMid) 0%, var(--mainColor) 100%);
  border: 2px solid var(--borderColor);
  box-shadow: 0 4px 16px rgba(44,21,5,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.create-btn:hover {
  transform: translateY(-2px) scale(1.06);
  box-shadow: 0 6px 20px rgba(44,21,5,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
}

.create-btn:active {
  transform: translateY(0) scale(0.97);
}

.create-icon {
  font-size: 1.8rem;
  color: #f5e9ce;
  line-height: 1;
  margin-top: -2px;
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
  font-size: 0.82rem;
  font-family: var(--app-font);
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
