<script setup lang="js">
import { ref, computed } from 'vue';
import api from "@/api/axios.js";

import AccountIcon from "../../components/icon/Account.vue"

import { APP_NAME } from "@/config/appConfig.js";
import { applyTheme, themes } from "../../utils/theme.js"

import closeIcon from "../icon/closeIcon.vue";
import editIcon from "../icon/editIcon.vue";
import deleteIcon from "../icon/deleteIcon.vue";
import CenterModal from '../common/CenterModal.vue';
import AddForm from '../common/AddForm.vue';


const props = defineProps({
    open: Boolean,
    categories: Array
});

const emit = defineEmits([
    "close",
    "select-category",
    "update-categories",
    "openSetting"
]);

//const categories = ref([]);
const selectedCategoryId = ref(null);

const isEditOpen = ref(false);
const editingCategory = ref(null);
const editName = ref("");
const editBg = ref("");
const editColor = ref("");
const editingCategoryId = ref(null);

//削除
const isDeleteOpen = ref(false);
const deleteTarget = ref(null);

const selectCategory = (cat) => {
    selectedCategoryId.value = cat.id;
    emit("select-category", cat);
};

const openDelete = (cat) => {
    deleteTarget.value = cat;
    isDeleteOpen.value = true;
};

//カテゴリ色プリセット
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

//カテゴリ編集
const openEdit = (cat) => {
    console.log("openEdit Click", cat);
    editingCategory.value = { ...cat };
    isEditOpen.value = true;

    editingCategoryId.value = cat.id;
    editName.value = cat.name;
    editBg.value = cat.bg;
    editColor.value = cat.color;
};

const editCategoryFields = computed(() => {
    if (!editingCategory.value) return [];

    return [
        {
            label: "カテゴリ名",
            type: "text",
            model: computed({
                get: () => editingCategory.value.name,
                set: v => editingCategory.value.name = v
            })
        },
        {
            label: "背景色",
            type: "colorPreset",
            model: computed({
                get: () => editingCategory.value.bg,
                set: v => editingCategory.value.bg = v
            }),
            preset: bgPreset
        },
        {
            label: "文字色",
            type: "colorPreset",
            model: computed({
                get: () => editingCategory.value.color,
                set: v => editingCategory.value.color = v
            }),
            preset: fontPreset
        },
    ];
});

//カテゴリの更新
const updateCategory = async () => {
  await api.put(`/api/category/${editingCategoryId.value}`, {
    cate_name: editingCategory.value.name,
    bg_color: editingCategory.value.bg,
    font_color: editingCategory.value.color
  });

  const newCategories = props.categories.map(c =>
    c.id === editingCategoryId.value
      ? {
          ...c,
          name: editingCategory.value.name,
          bg: editingCategory.value.bg,
          color: editingCategory.value.color
        }
      : c
  );
  emit("update-categories", newCategories);
  isEditOpen.value = false;
};

/*
const updateCategory = async () => {
    await api.put(`/api/category/${editingCategoryId.value}`, {
        cate_name: editingCategory.value.name,
        bg_color: editingCategory.value.bg,
        font_color: editingCategory.value.color
    });

    //フロント側のカテゴリ一覧を更新
    const tareget = categories.value.find(
        C => C.id === editingCategoryId.value
    );

    if (tareget) {
        tareget.name = editingCategory.value.name;
        tareget.bg = editingCategory.value.bg;
        tareget.color = editingCategory.value.color;
    }

    isEditOpen.value = false;
};
*/

//削除処理
const confirmDelete = async () => {
  await api.delete(`/api/category/${deleteTarget.value.id}`);

  const newCategories = props.categories.filter(
    c => c.id !== deleteTarget.value.id
  );

  emit("update-categories", newCategories);

  isDeleteOpen.value = false;
};
/*

const confirmDelete = async () => {
    try {
        await api.delete(`/api/category/${deleteTarget.value.id}`);

        //カテゴリ削除後に更新
        const newCategories = categories.value.filter(
            c => c.id !== deleteTarget.value.id
        );

        //Settingの一覧を即更新
        categories.value = newCategories;

        //Sidebar、Homeに反映
        emit("update-categories", newCategories);

        isDeleteOpen.value = false;
        deleteTarget.value = null;
    } catch (err) {
        console.error("カテゴリ削除失敗", err);
    }

    isDeleteOpen.value = false;
    deleteIcon.value = null;
};
*/

const selectTheme = async (themeId) => {
    applyTheme(themes[themeId]);

    await api.put("/api/users/theme", {
        theme_id: themeId
    })
};

</script>

<template>
    <div class="setting-sidebar" :class="{ open: props.open }">
        <div class="side-top">
            <button class="close-btn" @click="emit('close')">
                <closeIcon></closeIcon>
            </button>
            <div class="app-title">{{ APP_NAME }}</div>
        </div>
        <div>
            <div class="cate-setting">
                <h2>カテゴリの編集</h2>
                <ul class="category-list">
                    <li v-for="cat in categories" :key="cat.id" class="category-item"
                        :class="{ active: selectedCategoryId === cat.id }">
                        <span class="cate-name">
                            ・{{ cat.name }}
                        </span>
                        <div class="cate-actions">
                            <button class="icon-btn" @click.stop="openEdit(cat)" aria-label="編集">
                                <editIcon class="icon-btn"></editIcon>
                            </button>

                            <button class="icon-btn" @click.stop="openDelete(cat)" aria-label="削除">
                                <deleteIcon class="icon-btn"></deleteIcon>
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="setting-wrapper">
            <h2>設定</h2>
            <div class="account-wrapper">
                <h3><router-link to="/settings/account">
                        アカウント設定
                    </router-link></h3>
                <AccountIcon class="account-img"></AccountIcon>
            </div>
            <div class="theme-wrapper">
                <h3>テーマカラー</h3>
                <span class="theme-color blue" @click="selectTheme(1)"></span>
                <span class="theme-color pink" @click="selectTheme(2)"></span>
                <span class="theme-color green" @click="selectTheme(3)"></span>
                <span class="theme-color yellow" @click="selectTheme(4)"></span>
                <span class="theme-color purple" @click="selectTheme(5)"></span><br>
                <span class="theme-color gray" @click="selectTheme(6)"></span>
                <span class="theme-color navy" @click="selectTheme(7)"></span>
                <span class="theme-color dark" @click="selectTheme(99)"></span>
            </div>
        </div>
    </div>

    <CenterModal :show="isEditOpen" @close="isEditOpen = false">
        <AddForm :fields="editCategoryFields" @submit="updateCategory" confirmLabel="変更">
        </AddForm>
    </CenterModal>

    <!--削除用モーダル-->
    <CenterModal :show="isDeleteOpen" 
    @close="isDeleteOpen = false">
        <template #header>
            <h2>カテゴリの削除</h2>
        </template>
        <p class="text-box">「{{ deleteTarget?.name }}」を削除しますか？<br>
            <small>※このカテゴリの中の項目も削除されます。</small>
        </p>

        <template #footer>
            <div  class="btn-center">
                <button class="del-btn text-box" @click="confirmDelete">削除</button>
                <button class="del-btn text-box" @click="isDeleteOpen = false">キャンセル</button>
            </div>
        </template>
    </CenterModal>

    <!--背景オーバーレイ-->
    <div v-if="props.open" class="overlay" @click="emit('close')">
    </div>
</template>

<style scoped>
.close-btn {
    background-color: transparent;
    color: var(--theme-font);
    cursor: pointer;
}

.close-btn:hover {
    color: var(--theme-hover2);
}

.setting-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 240px;
    height: 100vh;
    background-color: #fff;
    transform: translateX(-100%);
    /*完全に画面から表示しないように*/
    transition: transform 0.3s ease;
    z-index: 1100;
    border-right: 6px solid var(--theme-main);
    background-color: var(--theme-sub);
}

.setting-sidebar.open {
    transform: translateX(0);
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
}

.side-top {
    background-color: var(--theme-main);
    display: flex;
    justify-content: space-between;
    height: 50px;
    align-items: center;
}

.text-box {
    text-align: center;
    font-size: 15px;
}

/*カテゴリ一覧 */
.category-list {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 14px;
    padding-bottom: 40px;
    margin-right: 20px;
    border-bottom: 2px solid var(--theme-accent);

}

.category-item {
    padding: 10px 12px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.icon-btn {
    background-color: transparent;
    opacity: 0.6;
    width: 20px;
    height: auto;
}

.icon-btn:hover {
    opacity: 1;
}

.cate-actions {
    display: flex;
    gap: 18px;
    cursor: pointer;
    color: var(--theme-font);
}

.cate-actions:hover {
    color: var(--theme-hover2);
}

.del-btn {
    background-color: var(--theme-main);
    color: var(--theme-font);
    margin-left: 20px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 15px;
    border-radius: 8px
}
.del-btn:hover {
    background-color: var(--theme-hover);
}
.btn-center {
    margin-left: 140px;
}
/*設定 */
.setting-sidebar {
            max-height: 100vh;
    overflow-y: auto;
}
.setting-wrapper,
.cate-setting {
    margin-left: 10px;
    color: var(--theme-font);
}

.account-wrapper {
    display: flex;
    gap: 5px;
    margin-left: 10px;
}

.account-wrapper a {
    color: inherit;
    text-decoration: none;
}

.account-wrapper a:visited {
    color: inherit;
}

.account-img {
    width: 25px;
}

/*テーマカラー */
.theme-wrapper {
    margin-left: 10px;
}

.theme-color {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 1px solid #000;
    border-radius: 50%;
    gap: 5px;
    margin-left: 5px;
    cursor: pointer;

}

.theme-color.blue {
    background: #8eadd7;
}

.theme-color.pink {
    background: #F8CCD1;
}

.theme-color.green {
    background: #8FD6B0;
}

.theme-color.yellow {
    background: #ffd92e;
}

.theme-color.purple {
    background: #B7A5E3;
}

.theme-color.gray {
    background: #BFC3C9;
}
.theme-color.navy {
    background: #002A5B;
}

.theme-color.dark {
    background: #000;
}

</style>