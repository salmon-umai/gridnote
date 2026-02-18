<script setup lang="js">
import { ref } from 'vue';
import api from "@/api/axios.js";

import { APP_NAME } from "@/config/appConfig.js";

import CenterModal from '../common/CenterModal.vue';
import AddForm from '../common/AddForm.vue';

import SettingIcon from '../icon/SettingIcon.vue';



//============カテゴリ追加============

// 新規カテゴリ入力欄の状態
const newCategoryName = ref("");
const newCategoryBg = ref("var(--theme-main)");
const newCategoryFont = ref("var(--theme-font)");

//選択中のカテゴリ
const selecterdCate = ref(null);
//HOMEに送るカテゴリIDを用意
const emit = defineEmits([
    "add-category",
    "select-category",
    "update-categories",
    "openSetting",
    "change-view"
]);
const selectCate = (cat) => {
    selecterdCate.value = cat.id;//アクティブ状態を覚えるため(UI)
    emit("select-category", cat);//アクティブ状態の情報を親に送るため
};

const props = defineProps({
    categories: {
        type: Array,
        required: true
    },
    viewMode: {
        type: String,
        prequired: true
    }
});

//色プリセット
const bgPreset = [
    "var(--theme-main)",
    "#FFDFDF",
    "#FFEBAF",
    "#C9F5D5",
    "#BDE3FF",
    "#E5D9FF"
];
const fontPreset = [
    "var(--theme-font)",
    "#000000",
    "#FFFFFF"
];

// ===== AddForm に渡すフィールド定義 =====
const fieldsCategory = [
    { label: "", type: "text", model: newCategoryName },
    { label: "背景色：", type: "colorPreset", model: newCategoryBg, preset: bgPreset },
    { label: "文字色：", type: "colorPreset", model: newCategoryFont, preset: fontPreset }
];

// ===== モーダル制御 =====
const openCategory = ref(false);

// ===== カテゴリ追加処理 API =====
const addCategory = async () => {
    try {
        const res = await api.post("/api/category", {
            //res: サーバ（Express + DB）が/api/category に対して返してきた結果一式を受け取ったもの
            //data は「サーバが res.json() で返した中身そのもの」。
            cate_name: newCategoryName.value,
            bg_color: newCategoryBg.value,
            font_color: newCategoryFont.value
        });
        //DBに追加されたカテゴリをVue側にpush
        emit("add-category", {
            id: res.data.cate_id,
            name: res.data.cate_name,
            bg: res.data.bg_color,
            color: res.data.font_color,
            sort_type: res.data.sort_type
        });

        // 入力欄リセット
        newCategoryName.value = "";
    } catch (error) {
        console.error("カテゴリ追加失敗", error);
    }
};


</script>

<template>
    <aside class="sidebar">

        <div class="side-top">
            <button class="menu-btn" @click="emit('openSetting')">
                <SettingIcon class="setting-icon"></SettingIcon>
            </button>
            <div class="app-title">{{ APP_NAME }}</div>
        </div>
        <!--＝＝＝＝＝通常メニュー＝＝＝＝＝-->


        <!-- カテゴリセクション -->
        <div class="section">
            <div class="section-title"><h2>カテゴリ</h2></div>

            <div v-for="cat in categories" :key="cat.id" class="category-item" :style="{
                '--bg-color': cat.bg,//元の背景
                color: cat.color
            }" :class="{ active: selecterdCate === cat.id }" @click="selectCate(cat)">
                <span class="cat-name">{{ cat.name }}</span>
            </div>

            <!--カテゴリの追加-->
            <div class="add-category" @click="openCategory = true">
                ＋ 新しいカテゴリ
            </div>
            <!--入力フォーム画面中央モーダル-->
            <CenterModal v-if="openCategory" @close="openCategory = false" :show="openCategory">
                <template #header>
                    <h2>カテゴリの追加</h2>
                </template>
                <AddForm :fields="fieldsCategory" confirmLabel="追加" @submit="addCategory">
                </AddForm>
            </CenterModal>

        </div>
        <div class="line"></div>
        <div class="section">
            <div class="view-wrapper">
                <div class="section-title">
                    <h2>表示</h2>
                </div>
                <div class="view-item"
                    :class="{ active: props.viewMode === 'list' }"
                    @click="$emit('change-view', 'list')">
                   <span v-if="props.viewMode === 'list'" class="dot">●</span>
                    <h3>リスト</h3>
                    <!--
                    <img :src="listicon" class="icon-img"></img>
                    -->
                </div>
                <div class="view-item"
                    :class="{ active: props.viewMode === 'calendar' }"
                    @click="$emit('change-view', 'calendar')">
                    <span v-if="props.viewMode === 'calendar'" class="dot">●</span>
                    <h3>カレンダー</h3>
                    <!--
                    <img :src="calendaricon" class="icon-img"></img>
                    -->
                </div>
            </div>
        </div>
    </aside>
</template>


<style scoped>
html,
body {
    height: 100%;
    margin: 0;
    padding: 0;
}

.setting-icon {
    cursor: pointer;
}

.menu-btn {
    background-color: transparent;
    color: var(--theme-font);
}

.menu-btn:hover {
    color: var(--theme-hover2);
}

.side-top {
    background-color: var(--theme-main);
    display: flex;
    justify-content: space-between;
    height: 50px;
    align-items: center;
    border-bottom: 10px solid var(--theme-accent);
}

.sidebar {
    width: 220px;
    background-color: #fff;
    border-right: 6px solid var(--theme-main);
    height: 100vh;
    position: relative;
}
.section-title {
    margin-top: 0;
    margin-left: 10px;
}
.section-title h2 {
    color: var(--theme-hover);
    margin-top: 0;
    margin-bottom: 0;
}

.view-item {
    margin-left: 10px;
    display: flex;
    cursor: pointer;
    gap: 5px;
    margin-top: 0;
    color: var(--theme-hover);
}
.view-item:hover {
    border-bottom: 2px solid var(--theme-accent);
    width: 140px;
}
.dot {
    color: var(--theme-accent);
    width: 12px;
    margin-top: 16px;
}
.view-item.active {
    opacity: 1;
}
.cat-name {
    font-size: 14px;
    font-weight: 600;
}

/* ===================カテゴリのアニメーション=================== */
.category-item {
    width: 180px;
    height: 20px;
    padding: 6px 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.category-item>span {
    position: relative;
    z-index: 3;
    /* テキスト最前面 */
    margin-left: 10px;
}

/*元背景 */
.category-item::before {
    content: "";
    position: absolute;
    inset: 0;

    background-color: var(--bg-color);
    z-index: 2;

    transform-origin: left center;
    transition: transform 0.2s ease;
    transform: scaleX(0.9);
}

/*選択されたカテゴリだけが帯が伸びる*/
.category-item.active::before {
    transform: scaleX(1);
}

.category-item:hover::before {
    transform: scaleX(1);
}

.add-category {
    margin-top: 10px;
    margin-left: 5px;
    width: 180px;
    color: var(--theme-hover);
    font-weight: 700;
    z-index: 3;
    font-size: 14px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.add-category:hover {
    transform: translateX(4px);
}

.section {
    padding: 20px 0;
    margin-bottom: 20px;
}

.line {
    border-bottom: 2px solid var(--theme-accent);
    margin-right: 20px;
}

.icon-img {
    width: 15px;
    height: auto;
}

/* ===================入力フォーム=================== */
.color-label {
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.circle-color {
    appearance: none;
    -webkit-appearance: none;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    padding: 0;
    cursor: pointer;
}

/* ピッカー内部の色部分を丸くする */
.circle-color::-webkit-color-swatch-wrapper {
    padding: 0;
    border-radius: 50%;
}

.circle-color::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
}

.add-box {
    margin-left: 15px;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.add-text {
    width: 280px;
    height: 25px;
}

.add-btn {
    width: 100px;
    height: 30px;
    background-color: var(--theme-main);
    color: var(--theme-font);
    border-radius: 4px;
}

.add-btn:hover {
    background-color: var(--theme-hover);
}

.close-btn {
    color: var(--theme-font);
    cursor: pointer;
    font-size: 14px;
}
</style>