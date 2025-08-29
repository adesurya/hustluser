<template>
  <div class="success-container">
    <SuccessIcon />
    <h2 class="success-title">Registration successful.</h2>
    <p class="success-message">
      Please check your email to verify your account before logging in.
    </p>
    <Mascot />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SuccessIcon from '../components/SuccessIcon.vue'
import Mascot from '../components/Mascot.vue'

export default {
  name: 'SignupSuccessView',
  components: {
    SuccessIcon,
    Mascot
  },
  setup() {
    const router = useRouter()

    onMounted(() => {
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    })

    return {}
  }
}
</script>