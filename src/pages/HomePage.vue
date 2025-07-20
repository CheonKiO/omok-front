<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useServerStore } from '@/stores/server';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/user';
import { useToast } from '@/composable/useToast';
import Card from '@/components/RoomListCard.vue';
import Modal from '@/components/ModalComp.vue';

const { show } = useToast();

const room = ref(null);
const roomList = ref([]);
const isLoading = ref(false);
const showModal = ref(false);

const roomName = ref(null);

const playerStore = usePlayerStore();
const player = {
  id: playerStore.playerId,
  name: playerStore.username,
};

const router = useRouter();
console.log(player.id); // 랜덤 UUID
const server = useServerStore();
// 방 생성 + 웹소켓 연결 함수
async function createRoomAndConnect() {
  if (roomName.value == null || roomName.value.trim().length < 2) {
    show('방 이름은 2글자 이상이어야 합니다', 'error', 1000);
    return;
  }
  try {
    // 1) 방 생성 API 호출
    const res = await axios.post(`${server.BASEURL}/api/rooms/create`, null, {
      params: { title: roomName.value },
    });

    if (res.status != 200) throw new Error('Failed to create room');

    room.value = await res.data;
    console.log('Room created:', room.value);
    // 2) join 요청
    const joinRes = await axios.post(`${server.BASEURL}/api/rooms/join/${room.value}`, player);

    if (joinRes.status !== 200) throw new Error('Failed to join room');

    console.log('Join success');

    router.push({ name: 'Room', params: { roomNo: room.value } });
  } catch (error) {
    console.error(error);
  }
}

// 직접 roomId로 입장 + 웹소켓 연결 함수
async function joinRoomAndConnect(roomId) {
  try {
    room.value = roomId;

    const joinRes = await axios.post(`${server.BASEURL}/api/rooms/join/${roomId}`, player);

    if (joinRes.status !== 200) throw new Error('Failed to join room');
    console.log('Join success:', roomId);
    router.push({ name: 'Room', params: { roomNo: room.value } });
  } catch (error) {
    console.error(error);
  }
}

const fetchRoomList = async () => {
  try {
    isLoading.value = true;
    const res = await axios.get(`${server.BASEURL}/api/rooms`);
    roomList.value = res.data; // 방 정보 배열
  } catch (error) {
    console.error('방 목록 로딩 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchRoomList);
</script>

<template>
  <div class="list">
    <button class="refresh-btn btn" @click="fetchRoomList">🔄 새로고침</button>

    <div v-if="isLoading">로딩 중...</div>

    <div v-else-if="roomList.length === 0">⚠ 방이 없습니다.</div>

    <div v-else>
      <div class="flex dir-col">
        <Card
          v-for="room in roomList"
          :key="room.roomId"
          :title="room.title"
          :personnel="room.players.length"
        >
          <button
            @click="joinRoomAndConnect(room.roomId)"
            :disabled="room.players.length >= 2"
            class="btn"
          >
            입장
          </button>
        </Card>
      </div>
    </div>

    <div class="p-10">
      <button @click="showModal = true" class="btn circle create-btn">
        <font-awesome-icon class="create-btn__icon" :icon="['fas', 'plus']" size="2xl" />
      </button>
    </div>
    <Modal
      :visible="showModal"
      @close="showModal = false"
      :headerContent="'방 생성하기'"
      :applyContent="'방 생성'"
      :applyFunction="createRoomAndConnect"
    >
      <div>
        <label for="room-name">방 이름</label>
        <input type="text" name="room-name" v-model="roomName" />
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.list {
  padding-top: 5rem;
  width: 70%;
  margin: 0 auto;
}
.create-btn {
  position: fixed;
  bottom: 5rem;
  right: 5rem;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  cursor: pointer;
  background-color: var(--mainColor);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  color: #fff;
  border: none;
}

.create-btn__icon {
  transition: transform 0.3s ease;
}
.create-btn:hover .create-btn__icon {
  transform: rotate(90deg);
}

.refresh-btn {
  margin: 1rem;
}
</style>
