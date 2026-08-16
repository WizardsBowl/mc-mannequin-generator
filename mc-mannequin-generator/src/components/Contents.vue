<script setup lang="ts">
import { ref } from 'vue'
import type GeneratingOptions from '../types/GeneratingOptions'
import { constructProfile } from '../utils/ConstructProfile'

const playerName = ref('Steve')
const profileOrigin = ref('Realtime')
const skinUrl = ref('')
const capeUrl = ref('')
const elytraUrl = ref('')

const outputProfileJson = ref('')

function generateMannequin() {
  console.log('Generating mannequin with the following parameters:')
  console.log('Player Name:', playerName.value)
  console.log('Profile Origin:', profileOrigin.value)
  if (profileOrigin.value === 'Url') {
    console.log('Skin URL:', skinUrl.value)
    console.log('Cape URL:', capeUrl.value)
    console.log('Elytra URL:', elytraUrl.value)
  }

  const options: GeneratingOptions = {
    playerName: playerName.value,
    profileOrigin: profileOrigin.value.toLowerCase() as 'realtime' | 'stored' | 'url' | 'pack',
    modelType: 'wide', // Default model type, you can add a selection for this if needed
    skinUrl: skinUrl.value || undefined,
    capeUrl: capeUrl.value || undefined,
    elytraUrl: elytraUrl.value || undefined,
  }
  constructProfile(options).then((profile) => {
    outputProfileJson.value = JSON.stringify(profile, null, 2)
    console.log('Generated Profile:', profile)
  }).catch((error) => {
    console.error('Error generating profile:', error)
  });
}
</script>

<template>
  <div class="contents">
    <h1>Contents</h1>
    <p>Welcome to the mc-mannequin-generator!</p>

    <div class="input-form">
      <div>
        <label for="player-name">Player Name:</label>
        <input type="text" id="player-name" v-model="playerName" />
      </div>
      <div>
        <input type="radio" id="mode-realtime" value="Realtime" v-model="profileOrigin" />
        <label for="mode-realtime">Realtime</label>
        <input type="radio" id="mode-stored" value="Stored" v-model="profileOrigin" />
        <label for="mode-stored">Stored</label>
        <input type="radio" id="mode-url" value="Url" v-model="profileOrigin" />
        <label for="mode-url">Url</label>
        <input type="radio" id="mode-pack" value="Pack" v-model="profileOrigin" />
        <label for="mode-pack">Pack</label>
      </div>
      <div v-if="profileOrigin === 'Url'">
        <label for="skin-url">Skin URL:</label>
        <input type="text" id="skin-url" v-model="skinUrl" />
        <label for="cape-url">Cape URL:</label>
        <input type="text" id="cape-url" v-model="capeUrl" />
        <label for="elytra-url">Elytra URL:</label>
        <input type="text" id="elytra-url" v-model="elytraUrl" />
      </div>
    </div>

    <button @click="generateMannequin">Generate Mannequin</button>

    <div class="output">
      <h2>Output</h2>
      <p>Check the console for the generated mannequin parameters.</p>
      <p id="output-profile-json">{{ outputProfileJson }}</p>
    </div>
  </div>
</template>