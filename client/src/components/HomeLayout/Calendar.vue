<script setup>
import { ref, computed, onMounted } from 'vue';
import api from "@/api/axios.js";


//カレンダーAPI
const calendarItems = ref([]);

onMounted(async () => {
    try {
    const res = await api.get(`/api/calendar`);  
    console.log("calendar api result:", res.data);
    
    calendarItems.value = res.data.map(item => ({
        ...item,
        dateKey: item.deadline.slice(0, 10)//yyyy-mm-dd
    }));

    } catch(err) {
    console.error("calendar api error:", err);
}
});


//表示中の月
const currentDate = ref(new Date());

const year = computed(() => currentDate.value.getFullYear());
const month = computed(() => currentDate.value.getMonth());

const displayMonth = computed(() => {
    return String(month.value + 1).padStart(2, '0');
})

//今月の日数
const daysInMonth = computed(() => {
    return new Date(year.value, month.value + 1, 0).getDate();
});

//日付ごとにタスクをまとめる
const itemsByDate = computed(() => {
    const map = {};//連想配列

    calendarItems.value.forEach(item => {
        if (!item.deadline) return;

        const key = item.deadline.slice(0, 10); //yyyy-mm-dd
        if (!map[key]) map[key] = [];//箱の作成
        map[key].push(item);//箱に追加
    });
    //2026-01-06 → [Event, Holiday]のように、日付をキーにして、
    //その日に属するタスクをまとめる。
    //例：itemsByDate["2026-01-21"]
    return map;
});

//yyyy-mm-dd
const dateKey = (day) => {
    return `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
//今日の日付
const todayKey = (() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
})();


//月送り
const nextMonth = () => {
    currentDate.value = new Date(
        year.value,
        month.value + 1,
        1
    );
};
const prevMonth = () => {
    currentDate.value = new Date(
        year.value,
        month.value - 1,
        1
    );
};




</script>

<template>
    <div class="calendar">
        
        <h1>Calendar</h1>
        <div class="month">
            <h2>{{ year }}/{{ displayMonth }}</h2>
            <button @click="prevMonth" class="calendar-btn">◀</button>
            <button @click="nextMonth" class="calendar-btn">▶</button>
        </div>
        <div class="calendar-grid">
            <div v-for="day in daysInMonth" :key="day" 
            class="day-cell"
            :class="{ today: dateKey(day) === todayKey }">
                <div class="day-number">
                    {{ day }}
                </div>
                <div v-for="item in itemsByDate[dateKey(day)]" 
                :key="item.id" class="item-list"
                :style="{
                    backgroundColor: item.bg_color,
                    color: item.font_color
                }">
                   {{ item.title }}
                </div>

            </div>
        </div>

    </div>

</template>

<style scoped>
.calendar {
    padding: 0 30px 30px 30px;
}

h1 {
    color: var(--theme-hover);
    font-size: 30px;
    border-bottom: 3px solid var(--theme-accent);
    margin-bottom: 0;
}
h2 {
    margin-left: 20px;
}

.month {
    display: flex;
    color: var(--theme-hover);
}

.calendar-btn {
    margin-top: 12px;
    margin-bottom: 10px;
    margin-left: 20px;
    font-size: 16px;
    width: 30px;
    height: 30px;
    background-color: transparent;
    cursor: pointer;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
}

.day-cell {
    border: 1px solid #ccc;
    background-color: #fff;
    height: 80px;
    padding: 4px;
    font-size: 12px;
    min-width: 60px;
}
.day-cell.today {
    background-color: var(--theme-accent);
}

.day-number {
    font-weight: bold;
}

.item-list {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 3px;
  border-radius: 5px;
}

.item-item {
  background-color: var(--theme-main);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
