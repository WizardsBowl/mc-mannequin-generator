<script setup lang="ts">
import { ref } from 'vue'
import type GeneratingOptions from '../types/GeneratingOptions'
import { constructProfile } from '../utils/ConstructProfile'
import { objectToNbt } from '../utils/JsonToNbt'

const playerName = ref('Steve')
const profileOrigin = ref('Realtime')
const skinUrl = ref('')
const capeUrl = ref('')
const modelType = ref('wide') // Default model type, you can add a selection for this if needed

const outputProfileJson = ref('')
const outputNbtData = ref('')
const outputSummonMannequin = ref('')
const outputGiveMannequin = ref('')
const outputGiveHead = ref('')

function generateMannequin() {
  const options: GeneratingOptions = {
    playerName: playerName.value,
    profileOrigin: profileOrigin.value.toLowerCase() as 'realtime' | 'stored' | 'url' | 'pack',
    modelType: modelType.value as 'wide' | 'slim',
    skinUrl: skinUrl.value || undefined,
    capeUrl: capeUrl.value || undefined,
  }
  console.log('Generating mannequin with options:', options)
  constructProfile(options).then((profile) => {
    outputProfileJson.value = JSON.stringify(profile, null, 2)
    outputNbtData.value = objectToNbt(profile)
    if (options.profileOrigin === 'realtime') {
      outputNbtData.value = outputNbtData.value.replace(/,name:"[^"]+"/, '') // MC特性：仅同时存在id和name时无法解析档案数据，这里去除name
    }
    let entityData = `profile:${outputNbtData.value},CustomName:{text:"${profile.name}",italic:false}`;
    outputSummonMannequin.value = `summon mannequin ~ ~ ~ {${entityData}}`
    outputGiveMannequin.value = `give @p allay_spawn_egg[entity_data={id:"mannequin",${entityData}},custom_name={text:"${profile.name}模型",italic:false}]`
    outputGiveHead.value = `give @p player_head[profile=${outputNbtData.value},custom_name={text:"${profile.name}的头",italic:false}]`
    console.log('Generated Profile:', profile)
  }).catch((error) => {
    console.error('Error generating profile:', error)
  });
}
</script>

<template>
  <div id="contents">
    <h1>MC玩家模型生成工具</h1>
    <div id="app-info">
      <label>v0.9</label>
      <label>by 碗里巫云</label>
      <a href="https://space.bilibili.com/1735847445" target="_blank">bilibili</a>
      <a href="https://github.com/WizardsBowl/mc-mannequin-generator" target="_blank">GitHub</a>
    </div>
    <p>一个 PWA 应用，帮助你在 MC 中生成具有特定皮肤的 玩家模型 / 玩家头颅。</p>
    <p class="warning-text">目前仅支持 Java 版。</p>

    <div class="divider"></div>

    <div id="input-form">
      <h2>输入</h2>
      <div>
        <label for="player-name">玩家名称</label>
        <input type="text" id="player-name" v-model="playerName" />
      </div>
      <div>
        <label>档案来源</label>
        <div class="radio-button-box">
          <p>
            <input type="radio" id="mode-realtime" value="Realtime" v-model="profileOrigin" />
            <label for="mode-realtime">实时更新</label>
          </p>
          <p>
            <input type="radio" id="mode-stored" value="Stored" v-model="profileOrigin" />
            <label for="mode-stored">预先存储URL</label>
          </p>
          <p>
            <input type="radio" id="mode-url" value="Url" v-model="profileOrigin" />
            <label for="mode-url">自定义URL</label>
          </p>
          <p>
            <input type="radio" id="mode-pack" value="Pack" v-model="profileOrigin" />
            <label for="mode-pack">资源包</label>
          </p>
        </div>
      </div>
      <div v-if="profileOrigin === 'Url' || profileOrigin === 'Pack'">
        <label>模型种类</label>
        <div class="radio-button-box">
          <p>
            <input type="radio" id="model-wide" value="wide" v-model="modelType" />
            <label for="model-wide">粗手臂</label>
          </p>
          <p>
            <input type="radio" id="model-slim" value="slim" v-model="modelType" />
            <label for="model-slim">细手臂</label>
          </p>
        </div>
      </div>
      <div v-if="profileOrigin === 'Url'">
        <label for="skin-url">皮肤 URL</label>
        <input type="text" id="skin-url" v-model="skinUrl" />
        <label for="cape-url">披风 URL</label>
        <input type="text" id="cape-url" v-model="capeUrl" />
      </div>
    </div>

    <div class="divider"></div>

    <div id="generate-button">
      <button @click="generateMannequin">生成</button>
    </div>

    <div class="divider"></div>

    <div id="output-form">
      <h2>输出</h2>
      <p>请复制生成的指令并在游戏中运行。</p>
      <p class="warning-text">注意：当指令长度过长时会被聊天框截断，此时应使用命令方块执行指令！</p>
      <label for="output-summon-mannequin">生成玩家模型指令</label>
      <textarea id="output-summon-mannequin" rows="2" readonly>{{ outputSummonMannequin }}</textarea>
      <label for="output-give-mannequin">给予玩家模型指令</label>
      <textarea id="output-give-mannequin" rows="2" readonly>{{ outputGiveMannequin }}</textarea>
      <label for="output-give-head">给予玩家头颅指令</label>
      <textarea id="output-give-head" rows="2" readonly>{{ outputGiveHead }}</textarea>
      <label for="output-profile-json">档案 JSON</label>
      <textarea id="output-profile-json" rows="12" readonly>{{ outputProfileJson }}</textarea>
      <label for="output-nbt-data">NBT 数据</label>
      <textarea id="output-nbt-data" rows="2" readonly>{{ outputNbtData }}</textarea>
    </div>
  </div>
</template>

<style scoped>
#contents {
  margin: 0;
  padding: 20px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

#input-form>div,
#output-form>div {
  margin: 16px auto;
}

#input-form textarea,
#output-form textarea {
  width: 100%;
  max-width: 600px;
  padding: 8px;
  box-sizing: border-box;
  font-size: 16px;
  white-space: pre;
}

#app-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

div.radio-button-box {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
}

div.radio-button-box p {
  margin: 0;
}

div.divider {
  margin: 20px 0;
  width: 100%;
  border-bottom: 1px solid #ccc;
}

.warning-text {
  color: red;
  font-weight: bold;
  font-size: 1em;
}

input[type="text"] {
  width: 100%;
  max-width: 400px;
  padding: 8px;
  margin: 5px auto;
  box-sizing: border-box;
  font-size: 16px;
  display: block;
}

textarea {
  resize: none;
  display: block;
  margin: 5px auto;
}

p {
  margin: 8px auto;
}

button {
  background-color: #f0f0f0;
}
</style>