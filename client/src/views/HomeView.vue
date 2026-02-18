<script setup lang="js">
import { ref, watch, onMounted, computed } from 'vue';

import Sidebar from '../components/HomeLayout/Sidebar.vue';
import HomeLayout from '../components/HomeLayout/HomeLayout.vue';
import Setting from '../components/HomeLayout/Setting.vue';
import Calendar from '../components/HomeLayout/Calendar.vue';

import api from '../api/axios.js';

const categories = ref([]);
const selectedCategoryData = ref(null);

const viewMode = ref('list');

const onSelectCategory = (cat) => {
  selectedCategoryData.value = cat;//cat本体で色、名前を含む
};

//Sidebarがemit("update-categories")したときに受け取る
//function updateCategories(cats) {
//  categories.value = cats;//ここでHomeのcategories が更新される};

const updateCategories = (updated) => {
  categories.value = updated;
};
const addCategory = (newCat) => {
  categories.value.push(newCat);
};

//categoriesを監視して、1番目を自動選択
watch(
  categories,
  () => {
    if(categories.value.length > 0) {
      selectedCategoryData.value = categories.value[0];
    }
  },
  { immediate: true }
  //immediate:watch 登録時に、最初の一回も強制実行される
  //watch 登録時に、最初の一回も強制実行したいときなど
);

//設定サイドバーの開閉状態
const isSettingOpen = ref(false);

//切り替え
const toggleSettingSidebar = () => {
  isSettingOpen.value = !isSettingOpen.value;
};

//カテゴリAPIと接続
onMounted(async () => {
    const res = await api.get(`/api/category`);  
    categories.value = res.data.map(cat => ({
        id: cat.cate_id,
        name: cat.cate_name,
        bg: cat.bg_color,
        color: cat.font_color,
        sort_type: cat.sort_type ?? "created_desc"
    }));
});

</script>

<template>
  <div class="layout">
    <!--既存Sidebar
    ハンバーガーを押したらイベントをemitしてApp.vueに通知-->
    <Sidebar
    :categories="categories"
    :viewMode="viewMode"
    @select-category="onSelectCategory"
    @update-categories="updateCategories"
    @openSetting="toggleSettingSidebar"
    @add-category="addCategory"
    @change-view="viewMode = $event">
    </Sidebar>
        <!--これをHomeLayoutに送る-->
    <div class="auth-layout">
      <!--設定用サイドバー
      画面全体に覆いかぶさるため、メインに置く-->
      <Setting 
      :open="isSettingOpen"
      @close="toggleSettingSidebar"
      :categories = categories
      @update-categories="categories = $event">
      </Setting>
      <HomeLayout 
      :selected-category-data="selectedCategoryData"
      v-if="viewMode === 'list'">
      </HomeLayout>
      <Calendar v-else>
      </Calendar>
    </div>
  </div>


</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.auth-layout {
  min-height: 100vh;
  flex: 1;/*残りのスペースすべて使うため*/
  overflow-y: auto;/*スクロールしても表示できるように*/
  background-image:
    linear-gradient(to right, #cccccc8b 1px, transparent 1px),
    linear-gradient(to bottom, #cccccc8b 1px, transparent 1px);
  background-size: 30px 30px;
  position: relative;/*Settingを重ねる */
}
</style>
