<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/user';
import { useToast } from '@/composable/useToast';
import { createRoom, joinRoom, fetchRooms } from '@/api/rooms';
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

    <div class="lobby-main">
      <div class="listhead">
        <h1 class="t">대국실<span class="cnt" v-if="!isLoading"><b class="num">{{ roomList.length }}</b>판</span></h1>
        <div class="head-actions">
          <button class="refresh" @click="fetchRoomList" title="새로고침" aria-label="새로고침">↻</button>
          <button class="create btn ju" @click="showModal = true"><span class="p">＋</span>새 대국</button>
        </div>
      </div>

      <div v-if="isLoading" class="empty">불러오는 중…</div>

      <div v-else-if="roomList.length === 0" class="empty">
        <span class="empty-mark"></span>
        <p>아직 열린 대국이 없습니다</p>
        <p class="hint">새 대국 버튼으로 방을 만들어보세요</p>
      </div>

      <div v-else class="rooms">
        <div
          v-for="room in roomList"
          :key="room.roomId"
          class="room"
          :class="{ full: room.players.length >= 2 }"
          @click="room.players.length < 2 && requestJoin(room)"
        >
          <span class="mini" :class="{ playing: room.players.length >= 2 }"><i></i><i></i><i></i></span>
          <span class="rtitle">{{ room.title }}</span>
          <span class="rmeta">
            <span class="seat">
              <span class="stone black"></span>
              <span class="stone" :class="room.players.length >= 2 ? 'white' : 'vacant'"></span>
            </span>
            <span class="num pcount">{{ room.players.length }}/2</span>
            <span class="tag" v-if="room.hasPassword">· 비공개</span>
            <span class="tag" v-else-if="room.players.length >= 2">· 관전</span>
          </span>
          <button
            class="enter"
            :disabled="room.players.length >= 2"
            @click.stop="requestJoin(room)"
          >{{ room.players.length >= 2 ? '대국 중' : '입장' }}</button>
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
  width: 80vw;
  max-width: 1040px;
  margin: 0 auto;
  padding: 1.5rem 26px 1.25rem;
  flex: 1;
  min-height: 0; /* 전역 헤더 아래 남은 높이 채움 — 페이지 자체는 스크롤 안 함 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 명패는 상단 고정, 목록만 남은 높이 채우며 내부 스크롤 */
.lobby-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 명패(masthead) */
.listhead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-shrink: 0;
}
.t {
  font-family: var(--display);
  font-size: 1.5rem;
  letter-spacing: 0.12em;
  color: var(--ink);
  margin: 0;
}
.t .cnt {
  font-size: 0.9rem;
  color: var(--ink-soft);
  margin-left: 14px;
  letter-spacing: 0.02em;
}
.t .cnt b { color: var(--ju); font-weight: 600; margin-right: 2px; }

.head-actions { display: flex; align-items: center; gap: 14px; }
.refresh {
  font-size: 1.15rem;
  line-height: 1;
  color: var(--ink-soft);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: color 0.15s, transform 0.35s ease;
}
.refresh:hover { color: var(--ink); transform: rotate(90deg); }
.create { margin: 0; padding: 8px 16px; border-radius: 3px; display: inline-flex; align-items: center; gap: 7px; font-size: 0.9rem; }
.create .p { font-size: 1rem; line-height: 1; }

/* 대장(ledger) — 목록만 내부 스크롤 */
.rooms {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-top: 1.5px solid var(--ink);
}
.empty {
  flex: 1;
  min-height: 0;
  border-top: 1.5px solid var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.empty-mark {
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--ink); opacity: 0.22; margin-bottom: 0.4rem;
}
.empty .hint { font-size: 0.8rem; opacity: 0.7; }

.room {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 16px;
  padding: 8px 4px;
  border-bottom: 1px solid rgba(33, 28, 22, 0.14);
  cursor: pointer;
}
.room.full { cursor: default; }
.room:hover { background: rgba(154, 58, 45, 0.05); }
.room.full:hover { background: none; }

.mini {
  width: 28px; height: 28px; position: relative;
  border: 1px solid var(--ink); background: var(--wood); border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgba(255, 240, 210, 0.12);
}
.mini::after {
  content: ''; position: absolute; left: 50%; top: 50%;
  width: 3px; height: 3px; border-radius: 50%; background: var(--line);
  transform: translate(-50%, -50%); opacity: 0.5;
}
.mini.playing::after { display: none; }
.mini i { position: absolute; width: 6px; height: 6px; border-radius: 50%; display: none; box-shadow: 0 1px 1px rgba(0,0,0,0.3); }
.mini.playing i { display: block; }
.mini.playing i:nth-child(1) { background: #17130e; left: 5px; top: 5px; }
.mini.playing i:nth-child(2) { background: #f3ecd9; left: 14px; top: 11px; }
.mini.playing i:nth-child(3) { background: #17130e; left: 9px; top: 17px; }

.rtitle {
  font-family: var(--display);
  font-size: 1rem;
  letter-spacing: 0.03em;
  color: var(--ink);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rmeta {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.85rem; color: var(--ink-soft); white-space: nowrap;
}
.seat { display: inline-flex; gap: 3px; align-items: center; }
.seat .stone { width: 12px; height: 12px; border-radius: 50%; display: inline-block; box-sizing: border-box; flex-shrink: 0; }
.seat .stone.black { background: radial-gradient(circle at 38% 34%, #4a453e, #17130e); }
.seat .stone.white { background: radial-gradient(circle at 38% 34%, #fff, #cfc7b4); box-shadow: inset 0 0 0 1px #b3a892; }
.seat .stone.vacant { border: 1px dashed rgba(33, 28, 22, 0.3); }
.rmeta .pcount { color: var(--ink); }
.rmeta .tag { color: var(--cheong); }

.enter {
  justify-self: end;
  font-family: var(--display);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  padding: 6px 16px;
  min-width: 82px;
  box-sizing: border-box;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  color: #f2e8d4;
  background: linear-gradient(180deg, #2c261a 0%, #1a150d 100%);
  box-shadow: 0 2px 4px rgba(20, 12, 4, 0.28), inset 0 1px 0 rgba(255, 240, 220, 0.08);
  transition: background 0.15s;
}
.enter:hover:not(:disabled) { background: linear-gradient(180deg, #3a3122 0%, #241d12 100%); }
.enter:disabled {
  background: transparent;
  color: var(--ink-soft);
  border: 1px solid rgba(33, 28, 22, 0.22);
  box-shadow: none;
  cursor: not-allowed;
}

/* 모달 필드 */
.modal-field {
  margin-bottom: 0.5rem;
}

.modal-field label {
  display: block;
  font-size: 0.82rem;
  color: var(--ink-soft);
  margin-bottom: 0.4rem;
  letter-spacing: 0.04em;
}

.modal-field input {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--gold);
  border-radius: 2px;
  font-size: 0.9rem;
  font-family: var(--app-font);
  background: rgba(255,255,255,0.7);
  color: var(--ink);
  box-sizing: border-box;
}

.modal-field input:focus {
  outline: none;
  border-color: var(--ju);
  box-shadow: 0 0 0 2px rgba(154,58,45,0.15);
}

.modal-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 0.75rem;
  border: 1px solid var(--ink);
  border-radius: 2px;
  overflow: hidden;
}

.toggle-btn {
  flex: 1;
  padding: 0.45rem 0;
  font-size: 0.85rem;
  font-family: var(--display);
  letter-spacing: 0.08em;
  background: transparent;
  border: none;
  color: var(--ink-soft);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.toggle-btn.active {
  background: var(--ink);
  color: #f2e8d4;
  font-weight: 600;
}

.toggle-btn:not(.active):hover {
  background: rgba(33,28,22,0.06);
}
</style>
