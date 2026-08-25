<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type GeneratingOptions from '../types/GeneratingOptions'
import type { AdvancedGeneratingOptions } from '../types/GeneratingOptions'
import type AshconProfile from '../types/AshconProfile'
import { constructProfile } from '../utils/ProfileConstructor'
import { objectToNbt } from '../utils/JsonToNbt'
import { getAshconProfile, getProfileTextures } from '../utils/MojangAPI'
import { generateResourcePack } from '../utils/ResourcePackGenerator'
import { getApprunsCount, addApprunsCount } from '../utils/WzbAPI'

const playerName = ref('Steve')
const profileOrigin = ref('Realtime')
const skinUrl = ref('')
const capeUrl = ref('')
const modelType = ref('wide') // Default model type, you can add a selection for this if needed
const skinFile = ref<File | null>(null)
const capeFile = ref<File | null>(null)

const enabledAdvancedOptions = ref(false)
const minFormat = ref(69)
const maxFormat = ref(88)
const packIconFile = ref<File | null>(null)
const description = ref('NPC')
const hideDescription = ref(false)
const immovable = ref(false)
const invulnerable = ref(false)
const mainHand = ref<'left' | 'right'>('right')
const pose = ref<'standing' | 'crouching' | 'swimming' | 'fall_flying' | 'sleeping'>('standing')

const outputProfileJson = ref('')
const outputNbtData = ref('')
const outputTexturesData = ref('')
const outputSummonMannequin = ref('')
const outputGiveMannequin = ref('')
const outputGiveHead = ref('')

const skinFileName = ref('未选择皮肤文件')
const capeFileName = ref('未选择披风文件')
const packIconFileName = ref('未选择资源包图标文件')

const errorDialogText = ref('')
const waitDialogText = ref('')
const appRunsCount = ref(0)

onMounted(() => {
  console.log('Contents component mounted.')
  tryGetApprunsCount()
})

async function generateMannequin() {
  if (!playerName.value) {
    showErrorDialog('玩家名称不能为空')
    return
  }
  if (profileOrigin.value === 'Url' && !skinUrl.value) {
    showErrorDialog('皮肤 URL 不能为空')
    return
  }
  if (profileOrigin.value === 'Pack' && !skinFile.value) {
    showErrorDialog('皮肤文件不能为空')
    return
  }
  if (enabledAdvancedOptions.value) {
    if (minFormat.value < 69 || maxFormat.value < 69) {
      showErrorDialog('资源包格式版本不能小于 69')
      return
    }
    if (minFormat.value > maxFormat.value) {
      showErrorDialog('最小格式版本不能大于最大格式版本')
      return
    }
  }

  const advancedOptions: AdvancedGeneratingOptions = {
    minFormat: minFormat.value,
    maxFormat: maxFormat.value,
    packIconFile: packIconFile.value,
    description: description.value,
    hideDescription: hideDescription.value,
    immovable: immovable.value,
    invulnerable: invulnerable.value,
    mainHand: mainHand.value,
    pose: pose.value,
  }

  const options: GeneratingOptions = {
    playerName: playerName.value,
    profileOrigin: profileOrigin.value.toLowerCase() as 'realtime' | 'stored' | 'url' | 'pack',
    modelType: modelType.value as 'wide' | 'slim',
    skinUrl: skinUrl.value,
    capeUrl: capeUrl.value,
    skinFile: skinFile.value,
    capeFile: capeFile.value,
    advancedOptions: enabledAdvancedOptions.value ? advancedOptions : undefined,
  }

  console.log('Generating mannequin with options:', options)

  try {
    showWaitDialog('正在生成')
    const ashconProfile = options.profileOrigin === 'realtime' || options.profileOrigin === 'stored' ? await getAshconProfile(options.playerName) : undefined;
    await handleGenerating(options, ashconProfile);
    tryAddApprunsCount()
  }
  catch (error) {
    console.error('Error generating profile:', error)
    showErrorDialog(`生成失败：${error instanceof Error ? error.message : String(error)}`)
  }
  finally {
    closeWaitDialog()
  }
}

async function handleGenerating(options: GeneratingOptions, ashconProfile?: AshconProfile) {
  const profile = constructProfile(options, ashconProfile);

  outputProfileJson.value = JSON.stringify(profile, null, 2)
  outputNbtData.value = objectToNbt(profile)
  if (ashconProfile) {
    outputTexturesData.value = JSON.stringify(getProfileTextures(ashconProfile), null, 2)
  }
  else {
    outputTexturesData.value = '暂无'
  }

  const advancedNbt = [
    options.advancedOptions?.description ? `description:"${options.advancedOptions.description}"` : undefined,
    options.advancedOptions?.hideDescription !== undefined ? `hide_description:${options.advancedOptions.hideDescription}` : undefined,
    options.advancedOptions?.immovable !== undefined ? `immovable:${options.advancedOptions.immovable}` : undefined,
    options.advancedOptions?.invulnerable !== undefined ? `Invulnerable:${options.advancedOptions.invulnerable}` : undefined,
    options.advancedOptions?.mainHand ? `main_hand:"${options.advancedOptions.mainHand}"` : undefined,
    options.advancedOptions?.pose ? `pose:"${options.advancedOptions.pose}"` : undefined
  ].filter(s => s).join(',')
  const entityData = `profile:${outputNbtData.value},CustomName:{text:"${options.playerName}",italic:false}${advancedNbt ? ',' + advancedNbt : ''}`;

  outputSummonMannequin.value = `summon mannequin ~ ~ ~ {${entityData}}`
  outputGiveMannequin.value = `give @p allay_spawn_egg[entity_data={id:"mannequin",${entityData}},custom_name={text:"${options.playerName}模型",italic:false}]`
  outputGiveHead.value = `give @p player_head[profile=${outputNbtData.value},custom_name={text:"${options.playerName}的头",italic:false}]`
  console.log('Generated Profile:', profile)

  if (options.profileOrigin === 'pack') {
    console.log('Generating resource pack.')
    const commands: Record<string, string> = {
      summon: outputSummonMannequin.value,
      give_mannequin: outputGiveMannequin.value,
      give_head: outputGiveHead.value
    };
    await generateResourcePack(options, profile, commands);
    console.log('Resource pack generated successfully.')
  }
}

function showErrorDialog(message: string) {
  errorDialogText.value = message
  const errorDialog = (document.getElementById('error-dialog') as HTMLDialogElement)
  errorDialog.showModal()
}

function closeErrorDialog() {
  const errorDialog = (document.getElementById('error-dialog') as HTMLDialogElement)
  errorDialog.close()
}

function showWaitDialog(title: string) {
  waitDialogText.value = title
  const waitDialog = (document.getElementById('wait-dialog') as HTMLDialogElement)
  waitDialog.showModal()
}

function closeWaitDialog() {
  const waitDialog = (document.getElementById('wait-dialog') as HTMLDialogElement)
  waitDialog.close()
}

function handleSkinFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    skinFile.value = (target.files[0])!;
  } else {
    skinFile.value = null;
  }
  skinFileName.value = skinFile.value?.name ?? 'null';
}

function handleCapeFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    capeFile.value = (target.files[0])!;
  } else {
    capeFile.value = null;
  }
  capeFileName.value = capeFile.value?.name ?? 'null';
}

function handlePackIconFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    packIconFile.value = (target.files[0])!;
  } else {
    packIconFile.value = null;
  }
  packIconFileName.value = packIconFile.value?.name ?? 'null';
}

function handleWaitDialogCancel(event: Event) {
  event.preventDefault(); // Prevent the dialog from closing
  console.log('Wait dialog cancel event triggered, but closing is prevented.');
}

function tryGetApprunsCount() {
  getApprunsCount('mc-mnqgrt').then(count => {
    console.log(`Fetched runs count: ${count}`)
    appRunsCount.value = count
  }).catch(error => {
    console.error('Failed to fetch app runs count:', error)
  })
}

function tryAddApprunsCount() {
  addApprunsCount('mc-mnqgrt').then(code => {
    console.log(`Add runs count successfully with code ${code}`)
  }).catch(error => {
    console.error('Failed to add app runs count:', error)
  })
}
</script>

<template>
  <div id="contents">
    <h1>MC玩家模型生成工具</h1>
    <div id="app-info">
      <p>
        v1.0.1 - 2026/08/24 - 
        <a href="https://blog.wizardsbowl.com/minecraft/software/mc-mnqgrt" target="_blank">使用文档</a>
      </p>
      <p>
        by 碗里巫云
        &nbsp;
        <a href="https://space.bilibili.com/1735847445" target="_blank">bilibili</a>
        &nbsp;
        <a href="https://github.com/WizardsBowl/mc-mannequin-generator" target="_blank">GitHub</a>
      </p>
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
        <div class="buttons-box">
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
        <div class="buttons-box">
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
      <div v-if="profileOrigin === 'Pack'">
        <label for="skin-file">皮肤文件</label>
        <label for="skin-file" class="file-name-label">{{ skinFileName }}</label>
        <input type="file" id="skin-file" accept="image/png" @change="handleSkinFileChange" />
        <label for="cape-file">披风文件</label>
        <label for="cape-file" class="file-name-label">{{ capeFileName }}</label>
        <input type="file" id="cape-file" accept="image/png" @change="handleCapeFileChange" />
      </div>
      <div>
        <input type="checkbox" id="advanced-options" v-model="enabledAdvancedOptions" />
        <label for="advanced-options">启用高级选项</label>
        <div v-if="enabledAdvancedOptions" id="advanced-options-container">
          <p class="warning-text">已启用高级选项</p>
          <div class="buttons-box">
            <p>
              <label for="min-format">最小格式版本</label>
              <input type="number" min="69" id="min-format" v-model.number="minFormat" />
            </p>
            <p>
              <label for="max-format">最大格式版本</label>
              <input type="number" min="69" id="max-format" v-model.number="maxFormat" />
            </p>
            <p>
              <a href="https://zh.minecraft.wiki/w/资源包#资源包格式版本" target="_blank">查询版本号</a>
            </p>
          </div>
          <label for="pack-icon-file">资源包图标文件</label>
          <label for="pack-icon-file" class="file-name-label">{{ packIconFileName }}</label>
          <input type="file" id="pack-icon-file" accept="image/png" @change="handlePackIconFileChange" />
          <label for="description">模型标签文本</label>
          <input type="text" id="description" v-model="description" />
          <div class="buttons-box">
            <p>
              <input type="checkbox" id="hide-description" v-model="hideDescription" />
              <label for="hide-description">隐藏模型标签</label>
            </p>
            <p>
              <input type="checkbox" id="immovable" v-model="immovable" />
              <label for="immovable">模型不可移动</label>
            </p>
            <p>
              <input type="checkbox" id="invulnerable" v-model="invulnerable" />
              <label for="invulnerable">模型无敌</label>
            </p>
          </div>
          <div class="buttons-box">
            <p>
              <label for="main-hand">模型主手</label>
              <select id="main-hand" v-model="mainHand">
                <option value="right">右手</option>
                <option value="left">左手</option>
              </select>
            </p>
            <p>
              <label for="pose">模型姿势</label>
              <select id="pose" v-model="pose">
                <option value="standing">站立</option>
                <option value="crouching">潜行</option>
                <option value="swimming">游泳</option>
                <option value="fall_flying">滑翔</option>
                <option value="sleeping">睡觉</option>
              </select>
            </p>
          </div>
        </div>
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
      <label for="output-textures-data">材质数据</label>
      <textarea id="output-textures-data" rows="12" readonly>{{ outputTexturesData }}</textarea>
    </div>

    <div class="divider"></div>

    <div>
      <p>本程序已运行 {{ appRunsCount }} 次</p>
    </div>
  </div>
  <dialog id="error-dialog">
    <div class="dialog-box">
      <h2>错误</h2>
      <p>{{ errorDialogText }}</p>
      <button @click="closeErrorDialog">确定</button>
    </div>
  </dialog>
  <dialog id="wait-dialog" @cancel="handleWaitDialogCancel">
    <div class="dialog-box">
      <h2>{{ waitDialogText }}</h2>
    </div>
  </dialog>
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
  font-size: 1em;
  white-space: pre;
}

#app-info {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

#error-dialog h2 {
  color: red;
}

#error-dialog p {
  margin: 16px auto;
}

#advanced-options-container {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

div.buttons-box {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
}

div.buttons-box p {
  margin: 0;
}

div.divider {
  margin: 20px 0;
  width: 100%;
  border-bottom: 1px solid var(--border-color);
}

label.file-name-label {
  display: block;
  box-sizing: border-box;
  margin: 5px auto;
  width: 100%;
  max-width: 400px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warning-text {
  color: red;
  font-weight: bold;
  font-size: 1.2em;
}

.dialog-box {
  max-width: 400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

input[type="text"] {
  width: 100%;
  max-width: 400px;
  padding: 8px;
  margin: 5px auto;
  box-sizing: border-box;
  font-size: 1em;
  display: block;
}

input[type="file"] {
  display: none;
  margin: 5px auto;
  font-size: 1em;
}

input[type="number"] {
  margin: 5px 0;
  font-size: 1em;
  width: 100px;
}

select {
  margin: 5px 0;
  font-size: 1em;
  width: 80px;
}

textarea {
  resize: none;
  display: block;
  margin: 5px auto;
}

p {
  margin: 8px auto;
}

dialog {
  border-radius: 8px;
}
</style>