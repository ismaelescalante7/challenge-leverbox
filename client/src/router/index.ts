import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Lazy load components
const Dashboard = () => import('@/views/DashboardView.vue')
const Tasks = () => import('@/views/TasksView.vue')
const TaskDetail = () => import('@/views/TaskDetailView.vue')
/* const Reports = () => import('@/views/ReportsView.vue')
const NotFound = () => import('@/views/NotFoundView.vue') */

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard',
      description: 'Overview of your tasks and statistics'
    }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: Tasks,
    meta: {
      title: 'Tasks',
      description: 'Manage your tasks'
    }
  },
  ,
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: () => import('@/views/TaskDetailView.vue'),
    meta: {
      title: 'Task Detail'
    },
    props: route => ({ 
      id: Number(route.params.id) 
    })
  },
 /*  {
    path: '/tasks/:id',
    name: 'task-detail',
    component: TaskDetail,
    props: (route) => ({ 
      id: parseInt(route.params.id as string) 
    }),
    meta: {
      title: 'Task Detail',
      description: 'View and edit task details'
    }
  },
  {
    path: '/reports',
    name: 'reports',
    component: Reports,
    meta: {
      title: 'Reports',
      description: 'Task reports and analytics'
    }
  },
  {
    path: '/404',
    name: 'not-found',
    component: NotFound,
    meta: {
      title: 'Page Not Found'
    }
  }, */
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Scroll to top on route change, unless returning to previous position
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Update document title
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} | Task Management`
  }
  
  // Validate route params
  if (to.name === 'task-detail') {
    const id = parseInt(to.params.id as string)
    if (isNaN(id) || id <= 0) {
      next('/404')
      return
    }
  }
  
  next()
})

router.afterEach((to) => {
  // Update meta description
  const description = to.meta.description as string
  if (description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }
  }
})

export default router