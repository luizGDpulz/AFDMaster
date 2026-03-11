const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AnalyzePage.vue') },
      { path: 'generator', component: () => import('pages/GeneratorPage.vue') },
      { path: 'docs', component: () => import('pages/DocsPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
