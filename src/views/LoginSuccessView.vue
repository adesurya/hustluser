<template>
  <div class="success-container">
    <SuccessIcon />
    <h2 class="success-title">Login successful</h2>
    <Mascot />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SuccessIcon from '../components/SuccessIcon.vue'
import Mascot from '../components/Mascot.vue'

export default {
  name: 'LoginSuccessView',
  components: {
    SuccessIcon,
    Mascot
  },
  setup() {
    const router = useRouter()

    onMounted(() => {
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    })

    return {}
  }
}
</script>