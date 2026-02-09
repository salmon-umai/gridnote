<script setup lang="js">
import { watch } from 'vue';
import ColorPreset from './ColorPreset.vue';
import StarRating from './StarRating.vue';

const props = defineProps({
    title: {
        type: String,
        default: ""
    },
    fields: {
        type: Array,
        required: true
    },
    confirmLabel: {
        type: String,
        default: "追加"
    },

    //編集用に初期値を受け取るため（追加時はnull)
    initialValues: {
      type: Object,
      default: null
    }
});

const emit = defineEmits(["submit"]);

//編集時は、initialValuesをfields.modelにセット
watch(
  () => props.initialValues,
  (values) => {
    if(!values)return;

    props.fields.forEach(field => {
      const key = field.key; //フィールドを識別するキー
      if (key && values[key] !== undefined) {
        field.model.value = values[key];
      }
    });
  },
  { immediate: true }
);

//送信処理：各field.modelから値を集めてemitする
const handleSubmit = () => {
  const result = {};
  props.fields.forEach(field => {
    if(field.key) {
      result[field.key] = field.model.value;
    }
  });

  emit("submit", result);
}

</script>

<template>
    <div class="add-form">
        <!--タイトル-->
        <h2 v-if="title" class="form-title">{{ title }}</h2>

        <div v-for="field in fields" :key="field.label" 
        class="form-field">
            <!--<div v-for="field in fields">:この中だけ field が生きている-->
        
            <!--ラベル（空は非表示）-->
            <label class="form-label" v-if="field.label">
                {{ field.label }}
            </label>

            <!--テキスト入力-->
            <input v-if="field.type === 'text'" 
            type="text"
            v-model="field.model.value"
            class="form-input"></input>

            <!--テキストエリア-->
            <div v-if="field.type === 'textarea'">
              <textarea v-model="field.model.value"></textarea>
            </div>

            <!--URL-->
            <input v-if="field.type === 'URL'" 
            type="URL"
            v-model="field.model.value"
            class="form-input"></input>

            <!--日付-->
            <input v-if="field.type === 'date'" 
            type="date"
            v-model="field.model.value"
            class="form-input"></input>

            <!--金額-->
            <input v-if="field.type === 'price'" 
            type="number"
            v-model.number="field.model.value"
            class="form-input"
            min="0"
            placeholder="金額を入力(半角数字)"></input>

            <!--カラープリセット-->
            <ColorPreset v-if="field.type === 'colorPreset'"
            v-model="field.model.value" 
            @update:modelValue="field.model.value = $event"
            :preset="field.preset"></ColorPreset>

            <!--優先度-->
            <div v-if="field.type === 'rating'">
              <StarRating v-model="field.model.value"></StarRating>
            </div>

        </div>


        <!--決定ボタン-->
        <button class="submit-btn" @click="handleSubmit">
            {{ confirmLabel }}
        </button>
    </div>

</template>


<style scoped>
textarea {
  font-size: 15px;
  padding: 10px;
  letter-spacing: 0.1em;
}
.add-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-title {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: bold;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-weight: 600;
}

.form-input {
  padding: 6px 8px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.submit-btn {
  margin-top: 10px;
  padding: 10px;
  background: var(--theme-main);
  color: #fff;
  font-weight: bold;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: 0.2s;
  font-size: 1.2em;
}

.submit-btn:hover {
  background: var(--theme-hover);
}

textarea {
  width: 370px;
  height: 50px;
  border-radius: 6px;
}
</style>