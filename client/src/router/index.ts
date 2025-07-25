import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Lazy load components
const Dashboard = () => import('@/views/DashboardView.vue')
const Tasks = () => import('@/views/TasksView.vue')
const Login = () => import('@/views/LoginView.vue')
const Register = () => import('@/views/RegisterView.vue')
const NotFound = () => import('@/views/NotFoundView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Iniciar Sesión',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      title: 'Registro',
      requiresGuest: true
    }
  },
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard',
      description: 'Overview of your tasks and statistics',
      requiresAuth: true
    }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: Tasks,
    meta: {
      title: 'Tasks',
      description: 'Manage your tasks',
      requiresAuth: true
    }
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: () => import('@/views/TaskDetailView.vue'),
    meta: {
      title: 'Task Detail',
      requiresAuth: true
    },
    props: route => ({
      id: Number(route.params.id)
    })
  },
  {
    path: '/404',
    name: 'not-found',
    component: NotFound,
    meta: {
      title: 'Page Not Found'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, initializeAuth } = useAuth()
  
  // Inicializar autenticación si hay token
  await initializeAuth()

  // Update document title
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} | Task Management`
  }

  // Check authentication requirements
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login')
    return
  }

  if (to.meta.requiresGuest && isAuthenticated.value) {
    next('/')
    return
  }

  // Validate route params
  if (to.name === 'TaskDetail') {
    const id = parseInt(to.params.id as string)
    if (isNaN(id) || id <= 0) {
      next('/404')
      return
    }
  }

  next()
})

export default router