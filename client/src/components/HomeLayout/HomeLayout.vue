<script setup>
   import { ref, computed, watch, onMounted } from "vue";
   import api from "@/api/axios.js"
   
   import CenterModal from "../common/CenterModal.vue";
   import AddForm from "../common/AddForm.vue";
   import StarRating from "../common/StarRating.vue";


   import AddBtn from "../icon/AddBtn.vue";
   import EditBtn from "../icon/EditBtn.vue";
   import DeleteBtn from "../icon/DeleteBtn.vue";
   
   //HomeVue→HomeLayout に渡されるカテゴリIDを受け取る部分
   const props = defineProps({
      //defineProps:props を受け取る専用のobjectを返す
      selectedCategoryData: Object,
      categories: Array //全カテゴリ（DB連携のため）
   });

   //モーダル制御
   const openItemModal = ref(false);
   const showCategoryWarning = ref(false);
   const showNoItemWarnig = ref(false);

   //項目追加フォーム入力
   const newItemTiltle = ref("");
   const newItemMemo = ref("");
   const newItemDeadline = ref("");
   const newItemPrioriry = ref(1);
   const newItemURL = ref("");
   const newItemPrice = ref("");
   
   //項目入力中断
   const resetItemFields = () => {
      newItemTiltle.value = "";
      newItemMemo.value = "";
      newItemDeadline.value = "";
      newItemPrioriry.value = 1;
      newItemURL.value = "";
      newItemPrice.value = "";
   };

   //編集モード用の状態
   const editMode = ref(false);
   const editingItem = ref(null);
   const openEditModal = ref(false);

   //AddForm.vue用のfields
   const fieldsItem = [
      { label: "タイトル", key:"title", type: "text", model: newItemTiltle },
      { label: "優先度", key:"priority", type: "rating", model: newItemPrioriry },
      { label: "期限", key:"deadline", type: "date", model: newItemDeadline },
      { label: "金額", key:"price", type: "price", model: newItemPrice },
      { label: "URL", key:"URL", type: "URL", model: newItemURL },
      { label: "メモ", key:"memo", type: "textarea", model: newItemMemo },
   ];

   //並び替えの処理の宣言
   const sortType = ref(null);

   //項目一覧
   const items = ref([]);

   //カテゴリが切り替わったらDBから項目を取得
   watch(
      () => props.selectedCategoryData,
      (cate) => {
         if(!cate) return;
         
         sortType.value = cate.sort_type;

         //カテゴリ切り替え時に編集モードを解除
         editMode.value = false;
         editingItem.value = null;

         //並び替えを反映
         fetchItems();
      },
   );

   //項目追加処理
   const addItem = async () => {
         if(!props.selectedCategoryData) return;

         const body = {
            cate_id: props.selectedCategoryData.id,
            title: newItemTiltle.value || null,
            memo: newItemMemo.value || null,
            deadline: newItemDeadline.value || null,
            price: newItemPrice.value || null,
            priority: newItemPrioriry.value,
            url: newItemURL.value || null,
         };

         try {
            //DBに登録
            const res = await api.post("/api/item", body);

            //VUe側のitemsにすぐ反映
            items.value.push({
               id: res.data.item_id,
               ...body,
               is_done: false
            });

            //入力欄リセット
            newItemTiltle.value = "";
            newItemMemo.value = "";
            newItemDeadline.value = "";
            newItemPrioriry.value = 1;
            newItemURL.value = "";
            newItemPrice.value = "";

            openItemModal.value = false;
            
         } catch(err) {
            console.error("項目追加エラー", err);
         }
   };
      
   //AddBtnを押したときの処理　警告
   const handleAddClick = () => {
      //カテゴリが0件または未選択の場合→警告
      if(!props.selectedCategoryData) {
         showCategoryWarning.value = true;
         return;
      }

      //カテゴリが１つ以上ある→通常の追加モーダル
      openItemModal.value = true;
   };

   //カテゴリIDで絞り込み
   const filteredItems = computed(() => {
      if(!props.selectedCategoryData) return [];
      return items.value.filter(
         item => item.cate_id === props.selectedCategoryData.id
      );
   });
   //完了済みを下に移動
   const sortedItems = computed(() => {
      return[...filteredItems.value].sort((a, b) => {
         if(a.is_done !== b.is_done) {
            return a.is_done - b.is_done//未完了⇒完了  false(0) → true(1)
         }
         return 0;//同じ状態なら順序維持
      });
   });

   //URLを成型する関数
   function formatURL(url) {
      //http:// か https:// が付いてなければ付ける
      if(!/^https?:\/\//i.test(url)) {
         return"https://" + url;
      }
      return url;
   };

   //金額を整える関数（３桁区切り）
   function formatPrice(value) {
      //からの場合は何も返さない
      if(value == null || value === '')
      return '';
      //３桁区切りにする
         return Number(value).toLocaleString('ja-jp');
   }

   //編集ボタン ＝＝＝＝＝編集処理＝＝＝＝＝
   const enterEditMode = () => {
      //編集モードのときに編集ボタンを押したら解除
      if(editMode.value) {
         editMode.value = false;
         editingItem.value = null;
         return;
      }

      //項目がないときは警告モーダル
      if(filteredItems.value.length === 0) {
         showNoItemWarnig.value = true;
         return;
      }
      //編集モード開始
      editMode.value = true;
   };

   //編集：項目クリック→編集モーダル
   const startEdit = (item) => {
      if(!editMode.value)return;

      editingItem.value = item;

      //AddFormに初期値を入れる
      newItemTiltle.value = item.title;
      newItemDeadline.value = item.deadline;
      newItemPrioriry.value = item.priority;
      newItemURL.value = item.url;
      newItemMemo.value = item.memo;
      newItemPrice.value = item.price;

      editMode.value = false;
      openEditModal.value = true;
   };

   //編集の内容を保存ボタン→更新
   //AddForm から result を受け取らず、
   //追加処理と同じくnewItemTitleたちのrefからbodyを組み立てる形
   //→AddForm の実装を気にしなくて済むため
   const submitEdit = async () => {
      if(!editingItem.value) return;

      //Vue側で持っているid（item_id 対応）
      const id = editingItem.value.id;

      //期限を成型する 空欄の場合は null、
      // それ以外は YYYY-MM-DD に変換
      //DATE型でMySQL時刻を持たないが、ここでは含まれてしまうので   
      //splitでTより前を分割して日付だけ取り出してDBに返す
      const formatDate = (d) => {
         if(!d) return null;
         return d.split("T")[0];
      };

      //入力中のrefからbodyを作る。追加処理と同じ
      const body = {
            title: newItemTiltle.value || null,
            memo: newItemMemo.value || null,
            deadline: formatDate(newItemDeadline.value),
            price: newItemPrice.value || null,
            priority: newItemPrioriry.value,
            url: newItemURL.value || null,
         };

      try {
         //DB更新
         await api.put(`/api/item/${id}`,body);

         //editingItemを置き換え
         Object.assign(editingItem.value, body);

         openEditModal.value = false;
         editingItem.value = null;
      } catch(err) {
         console.error("項目更新エラー",err);
      }
   };

   
//＝＝＝＝＝削除処理＝＝＝＝＝
   //Undo用に一時保存する場所
   const lastDeleteItems = ref([]);
   //削除トースト通知の表示制御
   const showDeleteToast = ref(false);
   const showNoDeleteToast = ref(false);

   //チェックを削除
   const deleteCheckedItems = async () => {
      //チェックしたものを取得
      const selected = items.value.filter(i => i.is_done);

      if(selected.length === 0) {
         showNoDeleteToast.value = true;
         
         setTimeout(() => {
         showNoDeleteToast.value = false;
         }, 2500);
         return;
      }
      //削除された項目を保持　DB導入前の処理
      //lastDeleteItems.value = selected;

      //UNDO用に削除対象を保存
      lastDeleteItems.value = selected.map(i => ({...i}));

      //item_idの配列にする
      const ids = selected.map(i => i.id);

      try {
         //serverへ削除リクエスト
         await api.post("/api/item/delete", {
            item_ids: ids
         });

         //チェックされていないものだけ残す → 削除完了　
         // Vueからも削除する処理
         items.value = items.value.filter(i => !i.is_done);

         //トースト通知表示
         showDeleteToast.value = true;
         
         //5秒後に自動で非表示
         setTimeout(() => {
            showDeleteToast.value = false;
         }, 5000);
      } catch(err) {
         console.error("削除エラー",err);
      }
   };
   
//Undo実行
const undoDelete = async () => {
      const ids = lastDeleteItems.value.map(i => i.id);

      try {
         await api.post("/api/item/undo", { item_ids: ids});
         
         //フロント側に復元
         items.value = [...items.value, ...lastDeleteItems.value];

         //状態クリア
         lastDeleteItems.value = [];
         showDeleteToast.value = false;
      } catch (err) {
         console.error("UNDOエラー", err);
      }
   };

//並び替えの処理(APIとの接続)
const fetchItems = async () => {
   if(!props.selectedCategoryData) return;

   const res = await api.get("/api/item", {
      params: {
         cate_id: props.selectedCategoryData.id,
         sort_type: sortType.value
      }
   });
   items.value = res.data.map(item => ({
      ...item,
      id: item.item_id,
      is_done: Boolean(item.is_done)
   }));
};

//並び替え変更を監視
watch(sortType, async(newVal, oldVal) => {
   if(!props.selectedCategoryData) return;
   if(newVal === oldVal) return;

   //並び替え反映
   fetchItems();

   //DBに保存
   await api.put("/api/category/sort", {
      cate_id: props.selectedCategoryData.id,
      sort_type: newVal
   });

   //フロントのカテゴリデータを更新
   props.selectedCategoryData.sort_type = newVal;
});

//カレンダーから切り替えたときに
// HomeLayoutが再生成される。そのときに並び順を反映させるため。
onMounted(() => {
   if(props.selectedCategoryData) {
      sortType.value = props.selectedCategoryData.sort_type;
   }
});

//チェックボックス完了状態を保存する関数
const updateDone = async (item) => {
   try {
      await api.put(`/api/item/${item.id}/done`, {
         is_done: item.is_done
      });
   } catch (err) {
      item.is_done = !item.is_done;
   }
}
</script>

<template>
   <!--選択カテゴリのヘッダー-->
   <div
      class="selected-category-header"
      v-if="props.selectedCategoryData"
      :style="{
         background: props.selectedCategoryData.bg,
         color: props.selectedCategoryData.color
      }">
      {{ props.selectedCategoryData.name }}
   </div>
   <div>
      <label class="sort">並び替え：</label>
      <select v-model="sortType" class="sort-select">
         <option value="created_desc">新しい順</option>
         <option value="updated_desc">更新順</option>
         <option value="priority_desc">優先度が高い順</option>
         <option value="priority_asc">優先度が低い順</option>
      </select>
   </div>
   <div
      v-if="editMode" class="edit-mode-title">
      編集モード
   </div>
   <!--項目リスト-->
   <div class="item-list">
      <div v-for="item in sortedItems" :key="item.id"
         class="item-card"
         :class="{ 
            'edit-hover' : editMode,
            'done-item' : item.is_done }"
         @click="startEdit(item)"
         :style="{
            borderColor: props.selectedCategoryData?.bg
         }">
         <input type="checkbox" class="item-check"
         v-model="item.is_done"
         @change="updateDone(item)"></input>
         
         <div class="item-content">
            <div class="item-title">{{ item.title  }}</div>
            <!--期限が空の場合は表示しない-->
            <div v-if="item.deadline" class="item-deadline">
               期限：{{ item.deadline }}
            </div>
            <span
               v-if="item.price !== null">
               金額：￥{{ formatPrice(item.price) }}
            </span>
            <div v-if="item.url" class="item-URL">
               URL：
               <a :href="formatURL(item.url)" target="_blank" 
               rel="noopener noreferrer">
               <!--target=_blank:リンクを新しいタブで開く
                  rel="noopener noreferrer"：セキュリティ上必須
               -->
                  {{ item.url }}
               </a>
            </div>
            <div v-if="item.memo" class="item-memo"
            :class="{ 'no-title': !item.title || item.title.trim() === ''}">
               {{ item.memo }}
            </div>
         </div>
         
         <!--右の表示-->
         <div class="item-priority">
            <StarRating :model-value="item.priority" 
            class="star-rating" 
            :readonly="true"></StarRating>
         </div>
      </div>
   </div>

   <!--項目の追加モーダル-->
   <CenterModal
   v-if="openItemModal"
   :show="openItemModal"
   @close="openItemModal = false; resetItemFields()">
      <template #header>
         <h2>項目の追加</h2>
      </template>
      <AddForm
       :fields="fieldsItem"
       confirmLabel="追加" @submit="addItem">

      </AddForm>
   </CenterModal>
   
   <!--編集モーダル-->
   <CenterModal
      v-if="openEditModal" :show="openEditModal"
      @close="openEditModal = false">
      <template #header>
         <h2>項目の編集</h2>
      </template>
      <AddForm
         :fields="fieldsItem"
         confirmLabel="保存"
         :initialValues="editingItem" @submit="submitEdit">
      </AddForm>
   </CenterModal>

   <!--カテゴリがない場合の警告モーダル-->
   <CenterModal
      v-if="showCategoryWarning"
      :show="showCategoryWarning"
      @close="showCategoryWarning = false">
      <div class="warning-text">
         ※<br>項目を追加するにはカテゴリが必要です。<br>
         左側のサイドバーにある「+新しいカテゴリ」から作成してください。
      </div>
   </CenterModal>

   <!--項目がないときに編集ボタンを押した場合の警告モーダル-->
   <CenterModal
      v-if="showNoItemWarnig" :show="showNoItemWarnig"
      @close="showNoItemWarnig = false">
      <div class="warning-text">
         ※<br>編集できる項目がありません。
      </div>
   </CenterModal>

   <!--項目ボタン-->
   <button class="add-item-btn All-btn" @click="handleAddClick"
   :disabled="editMode">
      <AddBtn class="icon-small"></AddBtn>
   </button>
   <button class="edit-item-btn All-btn" @click="enterEditMode">
      <EditBtn class="icon-small"></EditBtn>
   </button>
   <button class="del-item-btn All-btn" @click="deleteCheckedItems">
      <DeleteBtn class="icon-small"></DeleteBtn>
   </button>

   <!--トースト通知-->
   <div
      v-if="showNoDeleteToast" class="toast warning-toast">
      削除する項目が選択されていません。
   </div>
   <div
   v-if="showDeleteToast" class="toast">削除しました
   <button class="undo-btn" @click="undoDelete">元に戻す</button>
</div>

</template>

<style scoped>
.item-list {
   font-size: 15px;
}
.selected-category-header {
  padding: 12px 16px;
  text-align: center;
  height: 36px;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 25px;
  position: relative;
}

.warning-text {
   color: var(--theme-font);
}

/*完了済み*/
.item-card.done-item {
  background-color: #f0f0f0;
}
.item-card.done-item .item-title {
  text-decoration: line-through;
  text-decoration-color: rgba(0, 0, 0, 0.336);
  text-decoration-thickness: 2px;
}

/*=======ボタン======*/
.All-btn {
   background-color: transparent;
   position: fixed;
   background: none;
   border: none;
   cursor: pointer;
   transition: transform 0.25s ease;
   display: inline-flex;
   z-index: 1;
}
.icon-small {
  width: 65px;
  height: auto;
}
.add-item-btn {
   bottom: 40px;
   right: 50px;
   padding: 0;
}
.del-item-btn {
   bottom: 40px;
   right: 140px;
}
.edit-item-btn {
   bottom: 34px;
   right: 323px;
   width: 10px;
   height: auto;
}

/*=======項目一覧======*/

/*=======項目カード======*/
.item-list {
  padding-bottom: 130px; /* ボタンが重ならないようにスペース */
}

.item-card {
   background-color: #fff;
   min-height: 40px;
   padding: 10px 30px;
   display: flex;
   align-items: flex-start;
   gap: 16px;

   border: 2px solid #111;
   border-radius: 8px;
   margin-left: 50px;
   margin-bottom: 15px;
   margin-right: 80px;

   position: relative;
}
.item-check {
   transform: scale(1.4);
   margin-top: 10px;
   cursor: pointer;
   padding: 20px;
}

.item-priority {
  position: absolute;
  top: 12px;
  right: 16px;
  padding-bottom: 20px;
  margin-right: 30px;
}

.item-memo {
   padding-right: 40px;
   margin-top: 20px;
   padding-bottom: 10px;
}
.item-memo.no-title {
  padding-top: 20px;
}
.item-priority img {
   pointer-events: none;
}

.item-URL {
   margin-top: 5px;
}

/*編集モード関連*/
.edit-mode-title {
   font-size: 20px;
   padding: 6px 20px;   
   font-weight: bold;
   text-align: left;
   margin-bottom: 10px;
  color: #333;
}

.item-card.edit-hover:hover {
   transform: scale(1.03);
   transition: transform 0.15s ease-out;
   cursor: pointer;
   box-shadow: 0 0 8px rgba(0,0,0,0.15);
}
.All-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/*削除関連*/
.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: #333;
  color: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  animation: fadein 0.3s ease;
  z-index: 9999;
  padding: 30px 40px;
  border-radius: 6px;
  font-size: 15px;
}

.undo-btn {
  background: none;
  color: #ffd86b;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 15px;
}

@keyframes fadein {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.warning-toast {
  background: #f5d694;
  color: #333;
}

.sort {
   margin-left: 20px;
   font-size: 14px;
}
.sort-select {
   font-size: 14px;
   margin-bottom: 10px;
   width: 150px;
}

</style>