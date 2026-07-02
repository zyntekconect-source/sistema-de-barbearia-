/* ============================================================
   SCRIPT.JS — ZYNTEK BARBERSHOP MANAGEMENT SYSTEM
   Módulo principal de JavaScript. Arquitetura modular com
   separação clara de responsabilidades.
   Projeto Oficial Zyntek
   ============================================================ */

/* ------------------------------------------------------------
   SEÇÃO 1: CONFIGURAÇÃO GLOBAL E CONSTANTES
   Define a URL base da API, configurações do sistema e estado global.
   INTEGRAÇÃO BACK-END: Alterar BASE_API_URL para o endpoint real em produção.
   ------------------------------------------------------------ */

'use strict';

/* --- URL base da API (substituir em produção) --- */
const BASE_API_URL = 'https://api.barberpro.com.br/v1'; // SUBSTITUIR EM PRODUÇÃO

/* --- Estado global da aplicação --- */
const AppState = {
  currentLang:        localStorage.getItem('lang')  || 'pt',
  currentTheme:       localStorage.getItem('theme') || 'light',
  selectedDate:       null,   // Date selecionada no calendário
  selectedTime:       null,   // Horário selecionado
  calendarYear:       new Date().getFullYear(),
  calendarMonth:      new Date().getMonth(),
  appointmentToCancel: null,  // ID do agendamento em processo de cancelamento
  appointmentToReschedule: null, // ID do agendamento a reagendar
  rescheduleDate:     null,
  rescheduleTime:     null,
};

/* --- Store de agendamentos (simulação; substituir por fetch à API) ---
   INTEGRAÇÃO BACK-END: Este store é apenas para prototipação.
   Em produção, todos os dados vêm de GET /api/appointments?clientId={id}
*/
if (!window.appointmentsStore) {
  window.appointmentsStore = [];
}

/* --- Slots ocupados simulados por data (key: "YYYY-MM-DD", value: array de times) ---
   INTEGRAÇÃO BACK-END: substituir por GET /api/slots?date={date}
*/
if (!window.bookedSlotsStore) {
  window.bookedSlotsStore = {};
}

/* ============================================================
   SEÇÃO 2: DICIONÁRIO DE INTERNACIONALIZAÇÃO (i18n)
   Objeto com todas as strings do sistema em PT, EN e ES.
   INTEGRAÇÃO BACK-END: Pode ser servido via GET /api/i18n/{lang} para facilitar
   atualizações sem deploy de frontend.
   ============================================================ */
const i18n = {

  /* --- PORTUGUÊS (padrão) --- */
  pt: {
    /* Páginas */
    'page.title.home':       'Início — BarberPro',
    'page.title.login':      'Login — BarberPro',
    'page.title.register':   'Cadastro — BarberPro',
    'page.title.dashboard':  'Dashboard — BarberPro',

    /* Navegação */
    'nav.section.menu':        'Menu',
    'nav.section.account':     'Conta',
    'nav.section.management':  'Gestão',
    'nav.section.tools':       'Ferramentas',
    'nav.section.navigate':    'Navegar',
    'nav.home':                'Início',
    'nav.schedule':            'Agendar',
    'nav.myAppointments':      'Meus Agendamentos',
    'nav.profile':             'Perfil',
    'nav.dashboard':           'Painel Admin',
    'nav.today':               'Agenda do Dia',
    'nav.allAppointments':     'Todos Agendamentos',
    'nav.clients':             'Clientes',
    'nav.export':              'Exportar Dados',
    'nav.whatsapp':            'WhatsApp',
    'nav.clientArea':          'Área do Cliente',

    /* Papéis do usuário */
    'user.role.client':  'Cliente',
    'user.role.admin':   'Administrador',
    'user.role.barber':  'Barbeiro',

    /* Hero (inicio.html) */
    'hero.greeting':           'Olá,',
    'hero.subtitle':           'Pronto para agendar sua próxima visita?',
    'hero.nextAppointment':    'Próximo Agendamento',
    'hero.confirmed':          'Confirmado ✓',

    /* Agendamento */
    'schedule.title':          'Agendar Horário',
    'schedule.subtitle':       'Selecione um dia e horário disponível',

    /* Legendas do calendário */
    'legend.free':     'Livre',
    'legend.selected': 'Selecionado',
    'legend.booked':   'Ocupado',

    /* Slots */
    'slots.placeholder.title': 'Selecione um dia',
    'slots.placeholder.desc':  'Clique em um dia disponível no calendário para ver os horários',
    'slots.morning':           '☀️ Manhã',
    'slots.afternoon':         '🌤️ Tarde',
    'slots.noSlots':           'Nenhum horário disponível para este dia.',

    /* Meus Agendamentos */
    'myAppts.title':           'Meus Agendamentos',
    'myAppts.subtitle':        'Visualize, cancele ou reagende suas visitas',
    'myAppts.empty.title':     'Nenhum agendamento',
    'myAppts.empty.desc':      'Você ainda não possui agendamentos. Use o calendário acima para marcar sua visita!',
    'myAppts.empty.cta':       'Agendar Agora',

    /* Modal de agendamento */
    'modal.book.title':               'Confirmar Agendamento',
    'modal.book.date':                'Data',
    'modal.book.time':                'Horário',
    'modal.book.day':                 'Dia',
    'modal.book.services':            'Serviços Desejados',
    'modal.book.clientName':          'Nome Completo',
    'modal.book.clientNamePlaceholder': 'João da Silva',
    'modal.book.clientPhone':         'WhatsApp / Telefone',
    'modal.book.clientPhonePlaceholder': '(44) 99999-9999',
    'modal.book.notes':               'Observações (opcional)',
    'modal.book.notesPlaceholder':    'Ex: prefiro corte mais curto nas laterais',
    'modal.book.selectTime':          'Selecione o horário',
    'modal.book.validation.services': 'Selecione ao menos um serviço.',
    'modal.book.validation.name':     'Informe seu nome completo.',
    'modal.book.success':             'Agendamento confirmado com sucesso!',

    /* Modal de cancelamento */
    'modal.cancel.title':    'Cancelar Agendamento',
    'modal.cancel.subtitle': 'Esta ação não pode ser desfeita',
    'modal.cancel.msg':      'Tem certeza que deseja cancelar este agendamento? O horário será liberado automaticamente.',

    /* Modal de reagendamento */
    'modal.reschedule.title':    'Reagendar Visita',
    'modal.reschedule.subtitle': 'Escolha um novo dia e horário',

    /* Modal admin */
    'modal.adminBook.title':    'Novo Agendamento Manual',
    'modal.adminBook.subtitle': 'Criar agendamento diretamente pelo painel',

    /* Serviços */
    'service.hair':     'Cabelo',
    'service.beard':    'Barba',
    'service.eyebrow':  'Sobrancelha',

    /* Filtros */
    'filter.all':       'Todos',
    'filter.confirmed': 'Confirmados',
    'filter.pending':   'Pendentes',
    'filter.cancelled': 'Cancelados',

    /* Botões */
    'btn.login':             'Entrar',
    'btn.register':          'Criar Minha Conta',
    'btn.confirm':           'Confirmar',
    'btn.cancel':            'Cancelar',
    'btn.keep':              'Manter',
    'btn.cancelConfirm':     'Sim, Cancelar',
    'btn.rescheduleConfirm': 'Confirmar Reagendamento',
    'btn.refresh':           'Atualizar',
    'btn.newAppointment':    'Novo Agendamento',
    'btn.notifyAll':         'Notificar Todos',
    'btn.bookAndNotify':     'Agendar + WA',
    'btn.edit':              'Editar',
    'btn.exportClients':     'Exportar Lista',

    /* Dashboard */
    'dashboard.heading':              'Painel de Gestão',
    'dashboard.todayTitle':           'Agenda de Hoje',
    'dashboard.allAppointmentsTitle': 'Todos os Agendamentos',
    'dashboard.clientsTitle':         'Clientes',
    'dashboard.searchPlaceholder':    'Buscar cliente...',

    /* Estatísticas */
    'stats.today':       'Agendamentos Hoje',
    'stats.week':        'Esta Semana',
    'stats.month':       'Este Mês',
    'stats.revenue':     'Receita Est. (mês)',
    'stats.clients':     'Clientes Cadastrados',
    'stats.vsYesterday':  'vs ontem',
    'stats.vsLastWeek':   'vs semana passada',
    'stats.vsLastMonth':  'vs mês passado',
    'stats.vsLastRevenue':'vs mês anterior',
    'stats.newThisMonth': 'novos este mês',

    /* Tabela */
    'table.col.client':     'Cliente',
    'table.col.day':        'Dia',
    'table.col.time':       'Horário',
    'table.col.service':    'Serviço',
    'table.col.status':     'Status',
    'table.col.contact':    'Contato',
    'table.col.actions':    'Ações',
    'table.col.phone':      'Telefone',
    'table.col.totalVisits':'Visitas',
    'table.col.lastVisit':  'Última Visita',
    'table.empty':          'Nenhum agendamento encontrado',

    /* Status */
    'status.confirmed': 'Confirmado',
    'status.pending':   'Pendente',
    'status.cancelled': 'Cancelado',

    /* Auth */
    'auth.visual.subtitle':      'O sistema mais sofisticado para gestão de barbearias premium',
    'auth.feature.schedule':     'Agendamento online inteligente',
    'auth.feature.dashboard':    'Dashboard completo para gestão',
    'auth.feature.whatsapp':     'Integração com WhatsApp',
    'auth.feature.theme':        'Dark mode & Multi-idioma',
    'auth.orDivider':            'ou continue com',
    'auth.continueGoogle':       'Continuar com Google',

    /* Login */
    'login.title':          'Bem-vindo de volta',
    'login.subtitle':       'Entre com sua conta para continuar',
    'login.role.client':    'Cliente',
    'login.role.admin':     'Admin / Barbeiro',
    'login.email':          'E-mail',
    'login.emailPlaceholder':'seuemail@exemplo.com',
    'login.password':       'Senha',
    'login.remember':       'Lembrar de mim',
    'login.forgotPassword': 'Esqueceu a senha?',
    'login.noAccount':      'Não tem conta?',
    'login.register':       ' Cadastre-se grátis',

    /* Cadastro */
    'register.title':           'Criar conta',
    'register.subtitle':        'Preencha seus dados para começar',
    'register.visual.subtitle': 'Crie sua conta e tenha acesso ao agendamento online premium',
    'register.feature.fast':    'Cadastro rápido em segundos',
    'register.feature.secure':  'Seus dados protegidos com criptografia',
    'register.feature.booking': 'Agendamento online 24/7',
    'register.name':            'Nome Completo',
    'register.namePlaceholder': 'João da Silva',
    'register.email':           'E-mail',
    'register.phone':           'WhatsApp / Telefone',
    'register.password':        'Senha',
    'register.confirmPassword': 'Confirmar Senha',
    'register.progress':        'Completude do perfil',
    'register.passwordStrength':'Força da senha',
    'register.termsPrefix':     'Li e aceito os',
    'register.termsLink':       'Termos de Uso',
    'register.termsAnd':        ' e a',
    'register.privacyLink':     'Política de Privacidade',
    'register.hasAccount':      'Já tem conta?',
    'register.login':           ' Faça login',

    /* Página (títulos de heading) */
    'page.heading.home':   'Bem-vindo',

    /* Rodapé */
    'footer.privacy': 'Privacidade',
    'footer.terms':   'Termos',
    'footer.support': 'Suporte',

    /* Toast / notificações */
    'toast.cancelSuccess':     'Agendamento cancelado. Horário liberado!',
    'toast.rescheduleSuccess': 'Reagendamento realizado com sucesso!',
    'toast.error.generic':     'Ocorreu um erro. Tente novamente.',
    'toast.noService':         'Selecione ao menos um serviço.',
    'toast.noName':            'Informe seu nome.',
    'toast.copied':            'Copiado!',

    /* Meses */
    'months': ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    /* Dias semana curtos */
    'weekdays.short': ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  },

  /* --- ENGLISH --- */
  en: {
    'page.title.home':       'Home — BarberPro',
    'page.title.login':      'Login — BarberPro',
    'page.title.register':   'Register — BarberPro',
    'page.title.dashboard':  'Dashboard — BarberPro',

    'nav.section.menu':        'Menu',
    'nav.section.account':     'Account',
    'nav.section.management':  'Management',
    'nav.section.tools':       'Tools',
    'nav.section.navigate':    'Navigate',
    'nav.home':                'Home',
    'nav.schedule':            'Schedule',
    'nav.myAppointments':      'My Appointments',
    'nav.profile':             'Profile',
    'nav.dashboard':           'Admin Panel',
    'nav.today':               'Today\'s Schedule',
    'nav.allAppointments':     'All Appointments',
    'nav.clients':             'Clients',
    'nav.export':              'Export Data',
    'nav.whatsapp':            'WhatsApp',
    'nav.clientArea':          'Client Area',

    'user.role.client':  'Client',
    'user.role.admin':   'Administrator',
    'user.role.barber':  'Barber',

    'hero.greeting':        'Hello,',
    'hero.subtitle':        'Ready to book your next visit?',
    'hero.nextAppointment': 'Next Appointment',
    'hero.confirmed':       'Confirmed ✓',

    'schedule.title':   'Book a Time',
    'schedule.subtitle':'Select an available day and time',

    'legend.free':     'Available',
    'legend.selected': 'Selected',
    'legend.booked':   'Booked',

    'slots.placeholder.title': 'Select a Day',
    'slots.placeholder.desc':  'Click an available day on the calendar to see time slots',
    'slots.morning':           '☀️ Morning',
    'slots.afternoon':         '🌤️ Afternoon',
    'slots.noSlots':           'No available slots for this day.',

    'myAppts.title':       'My Appointments',
    'myAppts.subtitle':    'View, cancel or reschedule your visits',
    'myAppts.empty.title': 'No appointments',
    'myAppts.empty.desc':  'You have no appointments yet. Use the calendar above to book your visit!',
    'myAppts.empty.cta':   'Book Now',

    'modal.book.title':               'Confirm Booking',
    'modal.book.date':                'Date',
    'modal.book.time':                'Time',
    'modal.book.day':                 'Day',
    'modal.book.services':            'Desired Services',
    'modal.book.clientName':          'Full Name',
    'modal.book.clientNamePlaceholder': 'John Smith',
    'modal.book.clientPhone':         'WhatsApp / Phone',
    'modal.book.clientPhonePlaceholder': '(44) 99999-9999',
    'modal.book.notes':               'Notes (optional)',
    'modal.book.notesPlaceholder':    'E.g. prefer shorter sides',
    'modal.book.selectTime':          'Select a time',
    'modal.book.validation.services': 'Please select at least one service.',
    'modal.book.validation.name':     'Please enter your full name.',
    'modal.book.success':             'Appointment confirmed successfully!',

    'modal.cancel.title':    'Cancel Appointment',
    'modal.cancel.subtitle': 'This action cannot be undone',
    'modal.cancel.msg':      'Are you sure you want to cancel this appointment? The slot will be freed automatically.',

    'modal.reschedule.title':    'Reschedule Visit',
    'modal.reschedule.subtitle': 'Choose a new day and time',

    'modal.adminBook.title':    'Manual Booking',
    'modal.adminBook.subtitle': 'Create appointment directly from the panel',

    'service.hair':    'Hair',
    'service.beard':   'Beard',
    'service.eyebrow': 'Eyebrow',

    'filter.all':       'All',
    'filter.confirmed': 'Confirmed',
    'filter.pending':   'Pending',
    'filter.cancelled': 'Cancelled',

    'btn.login':             'Sign In',
    'btn.register':          'Create My Account',
    'btn.confirm':           'Confirm',
    'btn.cancel':            'Cancel',
    'btn.keep':              'Keep',
    'btn.cancelConfirm':     'Yes, Cancel',
    'btn.rescheduleConfirm': 'Confirm Reschedule',
    'btn.refresh':           'Refresh',
    'btn.newAppointment':    'New Appointment',
    'btn.notifyAll':         'Notify All',
    'btn.bookAndNotify':     'Book + WA',
    'btn.edit':              'Edit',
    'btn.exportClients':     'Export List',

    'dashboard.heading':              'Management Panel',
    'dashboard.todayTitle':           'Today\'s Schedule',
    'dashboard.allAppointmentsTitle': 'All Appointments',
    'dashboard.clientsTitle':         'Clients',
    'dashboard.searchPlaceholder':    'Search client...',

    'stats.today':       'Appointments Today',
    'stats.week':        'This Week',
    'stats.month':       'This Month',
    'stats.revenue':     'Est. Revenue (month)',
    'stats.clients':     'Registered Clients',
    'stats.vsYesterday':  'vs yesterday',
    'stats.vsLastWeek':   'vs last week',
    'stats.vsLastMonth':  'vs last month',
    'stats.vsLastRevenue':'vs previous month',
    'stats.newThisMonth': 'new this month',

    'table.col.client':     'Client',
    'table.col.day':        'Day',
    'table.col.time':       'Time',
    'table.col.service':    'Service',
    'table.col.status':     'Status',
    'table.col.contact':    'Contact',
    'table.col.actions':    'Actions',
    'table.col.phone':      'Phone',
    'table.col.totalVisits':'Visits',
    'table.col.lastVisit':  'Last Visit',
    'table.empty':          'No appointments found',

    'status.confirmed': 'Confirmed',
    'status.pending':   'Pending',
    'status.cancelled': 'Cancelled',

    'auth.visual.subtitle':   'The most sophisticated system for premium barbershop management',
    'auth.feature.schedule':  'Smart online booking',
    'auth.feature.dashboard': 'Complete management dashboard',
    'auth.feature.whatsapp':  'WhatsApp integration',
    'auth.feature.theme':     'Dark mode & Multi-language',
    'auth.orDivider':         'or continue with',
    'auth.continueGoogle':    'Continue with Google',

    'login.title':          'Welcome back',
    'login.subtitle':       'Sign in to your account to continue',
    'login.role.client':    'Client',
    'login.role.admin':     'Admin / Barber',
    'login.email':          'Email',
    'login.emailPlaceholder':'your@email.com',
    'login.password':       'Password',
    'login.remember':       'Remember me',
    'login.forgotPassword': 'Forgot password?',
    'login.noAccount':      'Don\'t have an account?',
    'login.register':       ' Sign up for free',

    'register.title':           'Create account',
    'register.subtitle':        'Fill in your details to get started',
    'register.visual.subtitle': 'Create your account and access premium online booking',
    'register.feature.fast':    'Quick sign-up in seconds',
    'register.feature.secure':  'Your data protected with encryption',
    'register.feature.booking': 'Online booking 24/7',
    'register.name':            'Full Name',
    'register.namePlaceholder': 'John Smith',
    'register.email':           'Email',
    'register.phone':           'WhatsApp / Phone',
    'register.password':        'Password',
    'register.confirmPassword': 'Confirm Password',
    'register.progress':        'Profile completion',
    'register.passwordStrength':'Password strength',
    'register.termsPrefix':     'I have read and accept the',
    'register.termsLink':       'Terms of Service',
    'register.termsAnd':        ' and the',
    'register.privacyLink':     'Privacy Policy',
    'register.hasAccount':      'Already have an account?',
    'register.login':           ' Sign in',

    'page.heading.home': 'Welcome',

    'footer.privacy': 'Privacy',
    'footer.terms':   'Terms',
    'footer.support': 'Support',

    'toast.cancelSuccess':     'Appointment cancelled. Slot freed!',
    'toast.rescheduleSuccess': 'Reschedule completed successfully!',
    'toast.error.generic':     'An error occurred. Please try again.',
    'toast.noService':         'Please select at least one service.',
    'toast.noName':            'Please enter your name.',
    'toast.copied':            'Copied!',

    'months': ['January','February','March','April','May','June','July','August','September','October','November','December'],
    'weekdays.short': ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  },

  /* --- ESPAÑOL --- */
  es: {
    'page.title.home':       'Inicio — BarberPro',
    'page.title.login':      'Iniciar Sesión — BarberPro',
    'page.title.register':   'Registro — BarberPro',
    'page.title.dashboard':  'Panel — BarberPro',

    'nav.section.menu':        'Menú',
    'nav.section.account':     'Cuenta',
    'nav.section.management':  'Gestión',
    'nav.section.tools':       'Herramientas',
    'nav.section.navigate':    'Navegar',
    'nav.home':                'Inicio',
    'nav.schedule':            'Reservar',
    'nav.myAppointments':      'Mis Citas',
    'nav.profile':             'Perfil',
    'nav.dashboard':           'Panel Admin',
    'nav.today':               'Agenda del Día',
    'nav.allAppointments':     'Todas las Citas',
    'nav.clients':             'Clientes',
    'nav.export':              'Exportar Datos',
    'nav.whatsapp':            'WhatsApp',
    'nav.clientArea':          'Área del Cliente',

    'user.role.client':  'Cliente',
    'user.role.admin':   'Administrador',
    'user.role.barber':  'Barbero',

    'hero.greeting':        '¡Hola,',
    'hero.subtitle':        '¿Listo para reservar tu próxima visita?',
    'hero.nextAppointment': 'Próxima Cita',
    'hero.confirmed':       'Confirmado ✓',

    'schedule.title':   'Reservar Hora',
    'schedule.subtitle':'Selecciona un día y hora disponible',

    'legend.free':     'Libre',
    'legend.selected': 'Seleccionado',
    'legend.booked':   'Ocupado',

    'slots.placeholder.title': 'Selecciona un día',
    'slots.placeholder.desc':  'Haz clic en un día disponible del calendario para ver los horarios',
    'slots.morning':           '☀️ Mañana',
    'slots.afternoon':         '🌤️ Tarde',
    'slots.noSlots':           'Sin horarios disponibles para este día.',

    'myAppts.title':       'Mis Citas',
    'myAppts.subtitle':    'Ver, cancelar o reprogramar tus visitas',
    'myAppts.empty.title': 'Sin citas',
    'myAppts.empty.desc':  '¡Aún no tienes citas. Usa el calendario de arriba para reservar tu visita!',
    'myAppts.empty.cta':   'Reservar Ahora',

    'modal.book.title':               'Confirmar Reserva',
    'modal.book.date':                'Fecha',
    'modal.book.time':                'Hora',
    'modal.book.day':                 'Día',
    'modal.book.services':            'Servicios Deseados',
    'modal.book.clientName':          'Nombre Completo',
    'modal.book.clientNamePlaceholder': 'Juan García',
    'modal.book.clientPhone':         'WhatsApp / Teléfono',
    'modal.book.clientPhonePlaceholder': '(44) 99999-9999',
    'modal.book.notes':               'Observaciones (opcional)',
    'modal.book.notesPlaceholder':    'Ej: prefiero los laterales más cortos',
    'modal.book.selectTime':          'Seleccionar hora',
    'modal.book.validation.services': 'Selecciona al menos un servicio.',
    'modal.book.validation.name':     'Ingresa tu nombre completo.',
    'modal.book.success':             '¡Reserva confirmada con éxito!',

    'modal.cancel.title':    'Cancelar Cita',
    'modal.cancel.subtitle': 'Esta acción no se puede deshacer',
    'modal.cancel.msg':      '¿Estás seguro de que deseas cancelar esta cita? El horario será liberado automáticamente.',

    'modal.reschedule.title':    'Reprogramar Visita',
    'modal.reschedule.subtitle': 'Elige un nuevo día y hora',

    'modal.adminBook.title':    'Nueva Reserva Manual',
    'modal.adminBook.subtitle': 'Crear reserva directamente desde el panel',

    'service.hair':    'Cabello',
    'service.beard':   'Barba',
    'service.eyebrow': 'Ceja',

    'filter.all':       'Todos',
    'filter.confirmed': 'Confirmados',
    'filter.pending':   'Pendientes',
    'filter.cancelled': 'Cancelados',

    'btn.login':             'Iniciar Sesión',
    'btn.register':          'Crear Mi Cuenta',
    'btn.confirm':           'Confirmar',
    'btn.cancel':            'Cancelar',
    'btn.keep':              'Mantener',
    'btn.cancelConfirm':     'Sí, Cancelar',
    'btn.rescheduleConfirm': 'Confirmar Reprogramación',
    'btn.refresh':           'Actualizar',
    'btn.newAppointment':    'Nueva Cita',
    'btn.notifyAll':         'Notificar a Todos',
    'btn.bookAndNotify':     'Reservar + WA',
    'btn.edit':              'Editar',
    'btn.exportClients':     'Exportar Lista',

    'dashboard.heading':              'Panel de Gestión',
    'dashboard.todayTitle':           'Agenda de Hoy',
    'dashboard.allAppointmentsTitle': 'Todas las Citas',
    'dashboard.clientsTitle':         'Clientes',
    'dashboard.searchPlaceholder':    'Buscar cliente...',

    'stats.today':       'Citas Hoy',
    'stats.week':        'Esta Semana',
    'stats.month':       'Este Mes',
    'stats.revenue':     'Ingresos Est. (mes)',
    'stats.clients':     'Clientes Registrados',
    'stats.vsYesterday':  'vs ayer',
    'stats.vsLastWeek':   'vs semana pasada',
    'stats.vsLastMonth':  'vs mes pasado',
    'stats.vsLastRevenue':'vs mes anterior',
    'stats.newThisMonth': 'nuevos este mes',

    'table.col.client':     'Cliente',
    'table.col.day':        'Día',
    'table.col.time':       'Hora',
    'table.col.service':    'Servicio',
    'table.col.status':     'Estado',
    'table.col.contact':    'Contacto',
    'table.col.actions':    'Acciones',
    'table.col.phone':      'Teléfono',
    'table.col.totalVisits':'Visitas',
    'table.col.lastVisit':  'Última Visita',
    'table.empty':          'No se encontraron citas',

    'status.confirmed': 'Confirmado',
    'status.pending':   'Pendiente',
    'status.cancelled': 'Cancelado',

    'auth.visual.subtitle':   'El sistema más sofisticado para gestión de barberías premium',
    'auth.feature.schedule':  'Reserva en línea inteligente',
    'auth.feature.dashboard': 'Panel de gestión completo',
    'auth.feature.whatsapp':  'Integración con WhatsApp',
    'auth.feature.theme':     'Modo oscuro y Multiidioma',
    'auth.orDivider':         'o continúa con',
    'auth.continueGoogle':    'Continuar con Google',

    'login.title':          'Bienvenido de nuevo',
    'login.subtitle':       'Inicia sesión en tu cuenta para continuar',
    'login.role.client':    'Cliente',
    'login.role.admin':     'Admin / Barbero',
    'login.email':          'Correo electrónico',
    'login.emailPlaceholder':'tucorreo@ejemplo.com',
    'login.password':       'Contraseña',
    'login.remember':       'Recuérdame',
    'login.forgotPassword': '¿Olvidaste tu contraseña?',
    'login.noAccount':      '¿No tienes cuenta?',
    'login.register':       ' Regístrate gratis',

    'register.title':           'Crear cuenta',
    'register.subtitle':        'Completa tus datos para comenzar',
    'register.visual.subtitle': 'Crea tu cuenta y accede a la reserva en línea premium',
    'register.feature.fast':    'Registro rápido en segundos',
    'register.feature.secure':  'Tus datos protegidos con cifrado',
    'register.feature.booking': 'Reserva en línea 24/7',
    'register.name':            'Nombre Completo',
    'register.namePlaceholder': 'Juan García',
    'register.email':           'Correo electrónico',
    'register.phone':           'WhatsApp / Teléfono',
    'register.password':        'Contraseña',
    'register.confirmPassword': 'Confirmar Contraseña',
    'register.progress':        'Completitud del perfil',
    'register.passwordStrength':'Fortaleza de contraseña',
    'register.termsPrefix':     'He leído y acepto los',
    'register.termsLink':       'Términos de Servicio',
    'register.termsAnd':        ' y la',
    'register.privacyLink':     'Política de Privacidad',
    'register.hasAccount':      '¿Ya tienes cuenta?',
    'register.login':           ' Inicia sesión',

    'page.heading.home': 'Bienvenido',

    'footer.privacy': 'Privacidad',
    'footer.terms':   'Términos',
    'footer.support': 'Soporte',

    'toast.cancelSuccess':     '¡Cita cancelada. Horario liberado!',
    'toast.rescheduleSuccess': '¡Reprogramación completada con éxito!',
    'toast.error.generic':     'Ocurrió un error. Inténtalo de nuevo.',
    'toast.noService':         'Selecciona al menos un servicio.',
    'toast.noName':            'Ingresa tu nombre.',
    'toast.copied':            '¡Copiado!',

    'months': ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    'weekdays.short': ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  }
};

/* ------------------------------------------------------------
   SEÇÃO 3: MÓDULO DE INTERNACIONALIZAÇÃO (i18n)
   Funções para tradução e aplicação de idioma em toda a interface.
   INTEGRAÇÃO BACK-END: Idioma preferido do usuário via PATCH /api/users/{id}/preferences
   ------------------------------------------------------------ */

/**
 * Retorna a string traduzida para a chave e idioma atual.
 * @param {string} key - Chave do dicionário i18n
 * @param {string} [lang] - Idioma (padrão: AppState.currentLang)
 * @returns {string}
 */
function t(key, lang) {
  const l = lang || AppState.currentLang;
  const dict = i18n[l] || i18n['pt'];
  return dict[key] !== undefined ? dict[key] : (i18n['pt'][key] || key);
}

/**
 * Aplica todas as traduções na página via atributos data-i18n.
 * Varre o DOM e substitui textContent e placeholder de cada elemento marcado.
 */
function applyTranslations() {
  const lang = AppState.currentLang;

  /* --- Traduz textContent --- */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key, lang);
    if (translation && typeof translation === 'string') {
      el.textContent = translation;
    }
  });

  /* --- Traduz placeholders --- */
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = t(key, lang);
    if (translation) el.placeholder = translation;
  });

  /* --- Traduz title do documento --- */
  const pageKey = document.querySelector('title[data-i18n]')?.getAttribute('data-i18n');
  if (pageKey) document.title = t(pageKey, lang);

  /* --- Atualiza lang do html --- */
  const langMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
  document.documentElement.lang = langMap[lang] || 'pt-BR';
}

/**
 * Define o idioma ativo, salva na preferência e re-renderiza a interface.
 * @param {string} lang - 'pt' | 'en' | 'es'
 */
function setLanguage(lang) {
  if (!i18n[lang]) return;
  AppState.currentLang = lang;
  localStorage.setItem('lang', lang);

  /* Atualiza flag e label no header */
  const flags  = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' };
  const labels = { pt: 'PT',   en: 'EN',  es: 'ES'  };
  const flagEl  = document.getElementById('currentFlag');
  const labelEl = document.getElementById('currentLangLabel');
  if (flagEl)  flagEl.textContent  = flags[lang];
  if (labelEl) labelEl.textContent = labels[lang];

  /* Marca opção selecionada no dropdown */
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.lang === lang);
  });

  /* Fecha dropdown */
  const dd = document.getElementById('langDropdown');
  if (dd) dd.classList.remove('open');
  const btn = document.getElementById('langBtn');
  if (btn) btn.setAttribute('aria-expanded', 'false');

  /* Aplica todas as traduções */
  applyTranslations();

  /* Re-renderiza calendário (meses e dias têm nome localizado) */
  if (typeof renderCalendar === 'function') renderCalendar();

  /* Atualiza preferência no back-end (assíncrono, sem bloquear UI) */
  /* INTEGRAÇÃO BACK-END:
     const token = localStorage.getItem('authToken');
     if (token) fetch(BASE_API_URL + '/users/me/preferences', {
       method: 'PATCH',
       headers: { 'Content-Type':'application/json', Authorization: 'Bearer '+token },
       body: JSON.stringify({ lang })
     });
  */
}

/**
 * Abre/fecha o dropdown de idioma.
 */
function toggleLangDropdown() {
  const dd  = document.getElementById('langDropdown');
  const btn = document.getElementById('langBtn');
  if (!dd) return;
  const isOpen = dd.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    /* Fechar ao clicar fora */
    setTimeout(() => {
      document.addEventListener('click', closeLangDropdownOutside, { once: true });
    }, 0);
  }
}

function closeLangDropdownOutside(e) {
  const selector = document.getElementById('langSelector');
  if (selector && !selector.contains(e.target)) {
    const dd = document.getElementById('langDropdown');
    if (dd) dd.classList.remove('open');
    const btn = document.getElementById('langBtn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
}

/* ------------------------------------------------------------
   SEÇÃO 4: MÓDULO DE TEMA (DARK / LIGHT MODE)
   Controla a alternância de tema e persiste a preferência.
   INTEGRAÇÃO BACK-END: Preferência salva via PATCH /api/users/{id}/preferences { theme }
   ------------------------------------------------------------ */

/**
 * Aplica o tema ao document e atualiza os controles visuais.
 * @param {string} theme - 'light' | 'dark'
 */
function applyTheme(theme) {
  AppState.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  /* Atualiza todos os toggles de tema na página */
  document.querySelectorAll('.theme-toggle').forEach(toggle => {
    toggle.classList.toggle('dark', theme === 'dark');
    toggle.setAttribute('aria-checked', String(theme === 'dark'));
  });

  document.querySelectorAll('#themeIcon').forEach(icon => {
    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  });
}

/**
 * Alterna entre dark e light mode.
 */
function toggleTheme() {
  const next = AppState.currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(next);

  /* INTEGRAÇÃO BACK-END:
     const token = localStorage.getItem('authToken');
     if (token) fetch(BASE_API_URL + '/users/me/preferences', {
       method: 'PATCH',
       headers: { 'Content-Type':'application/json', Authorization:'Bearer '+token },
       body: JSON.stringify({ theme: next })
     });
  */
}

/* ------------------------------------------------------------
   SEÇÃO 5: MÓDULO DE CALENDÁRIO
   Renderiza o calendário mensal com as regras de negócio de dias
   permitidos para agendamento (Seg–Sex e Sáb).
   INTEGRAÇÃO BACK-END: Para marcar dias com agendamentos (pontinhos verdes),
   fazer GET /api/appointments/summary?month={YYYY-MM} e marcar
   os dias retornados com a classe 'has-appointments'.
   ------------------------------------------------------------ */

const BUSINESS_DAYS = [1, 2, 3, 4, 5, 6]; // Segunda(1) a Sábado(6). Domingo(0) bloqueado.

/**
 * Renderiza o grid do calendário para o mês/ano em AppState.
 */
function renderCalendar() {
  const grid  = document.getElementById('calendarDaysGrid');
  const label = document.getElementById('calendarMonthLabel');
  if (!grid || !label) return;

  const year  = AppState.calendarYear;
  const month = AppState.calendarMonth;
  const today = new Date();

  /* Rótulo do mês com internacionalização */
  const monthNames = t('months');
  label.textContent = `${monthNames[month]} ${year}`;

  /* Calcula primeiro dia e total de dias do mês */
  const firstDay   = new Date(year, month, 1).getDay();  // 0=Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  grid.innerHTML = '';

  /* Células vazias antes do primeiro dia */
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day other-month';
    empty.setAttribute('aria-hidden', 'true');
    grid.appendChild(empty);
  }

  /* Células dos dias */
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dow  = date.getDay();
    const isToday    = (year === today.getFullYear() && month === today.getMonth() && day === today.getDate());
    const isPast     = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isWorkday  = BUSINESS_DAYS.includes(dow);
    const isSelected = AppState.selectedDate &&
                       AppState.selectedDate.getFullYear() === year &&
                       AppState.selectedDate.getMonth()    === month &&
                       AppState.selectedDate.getDate()     === day;

    const dateKey    = formatDateKey(year, month, day);
    const hasBookings = window.bookedSlotsStore?.[dateKey]?.length > 0;

    let classes = ['calendar-day'];
    if (!isWorkday || isPast)  classes.push('disabled');
    if (isToday)               classes.push('today');
    if (isSelected)            classes.push('selected');
    if (hasBookings && isWorkday && !isPast) classes.push('has-appointments');

    const cell = document.createElement('div');
    cell.className = classes.join(' ');
    cell.textContent = day;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `${day} de ${monthNames[month]} de ${year}${isToday ? ' (hoje)' : ''}${!isWorkday ? ', indisponível' : ''}`);
    if (!isWorkday || isPast) {
      cell.setAttribute('aria-disabled', 'true');
    } else {
      cell.setAttribute('tabindex', isSelected ? '0' : '-1');
      cell.addEventListener('click', () => selectCalendarDay(year, month, day));
      cell.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCalendarDay(year, month, day); } });
    }
    grid.appendChild(cell);
  }
}

/**
 * Navega para o mês anterior ou próximo.
 * @param {number} direction - -1 (anterior) | +1 (próximo)
 */
function changeMonth(direction) {
  AppState.calendarMonth += direction;
  if (AppState.calendarMonth < 0)  { AppState.calendarMonth = 11; AppState.calendarYear--; }
  if (AppState.calendarMonth > 11) { AppState.calendarMonth = 0;  AppState.calendarYear++; }
  AppState.selectedDate = null;
  AppState.selectedTime = null;
  renderCalendar();
  hideSlotsPanel();
}

/**
 * Seleciona um dia no calendário e carrega os slots disponíveis.
 * @param {number} year
 * @param {number} month
 * @param {number} day
 */
function selectCalendarDay(year, month, day) {
  AppState.selectedDate = new Date(year, month, day);
  AppState.selectedTime = null;
  renderCalendar();
  loadAndRenderSlots(year, month, day);
}

/* ------------------------------------------------------------
   SEÇÃO 6: MÓDULO DE SLOTS DE HORÁRIO
   Calcula e renderiza os horários disponíveis para o dia selecionado.
   Regra de negócio:
     • Seg–Sex: 09:00–11:30 (manhã) e 14:00–18:30 (tarde), intervalos de 30min
     • Sáb:     08:00–11:30 (manhã apenas), intervalos de 30min
   INTEGRAÇÃO BACK-END: GET /api/slots?date={YYYY-MM-DD}&barberId={id}
   Retorna: [ { time: "09:00", status: "free"|"booked" } ]
   ------------------------------------------------------------ */

/**
 * Gera array de horários no formato "HH:MM" entre startH e endH (exclusive),
 * de 30 em 30 minutos.
 */
function generateTimeSlots(startH, startM, endH, endM) {
  const slots = [];
  let h = startH, m = startM;
  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    m += 30;
    if (m >= 60) { m -= 60; h++; }
  }
  return slots;
}

/**
 * Carrega e renderiza os slots para a data selecionada.
 * Em produção, substituir a simulação por fetch à API.
 */
async function loadAndRenderSlots(year, month, day) {
  const placeholder = document.getElementById('slotsPlaceholder');
  const content     = document.getElementById('slotsContent');
  const dateLabel   = document.getElementById('slotsDateLabel');
  if (!content) return;

  /* Mostra loading */
  if (placeholder) placeholder.style.display = 'none';
  content.style.display = 'block';
  if (dateLabel) {
    const date = new Date(year, month, day);
    const weekdays = t('weekdays.short');
    const months   = t('months');
    const dow = weekdays[date.getDay()];
    dateLabel.textContent = `${dow}, ${day} de ${months[month]} de ${year}`;
  }

  /* Identifica regra de negócio pelo dia da semana */
  const date = new Date(year, month, day);
  const dow  = date.getDay();
  const dateKey = formatDateKey(year, month, day);

  /* INTEGRAÇÃO BACK-END: substituir por:
     const res   = await fetch(`${BASE_API_URL}/slots?date=${dateKey}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('authToken') } });
     const data  = await res.json(); // [{ time, status }]
     const booked = data.filter(s => s.status === 'booked').map(s => s.time);
  */
  const booked = window.bookedSlotsStore?.[dateKey] || [];

  let mornSlots = [];
  let afterSlots = [];

  if (dow === 6) {
    /* Sábado: só manhã 08:00–12:00 */
    mornSlots  = generateTimeSlots(8, 0, 12, 0);
    afterSlots = [];
  } else {
    /* Seg–Sex: manhã 09:00–12:00, tarde 14:00–19:00 */
    mornSlots  = generateTimeSlots(9, 0, 12, 0);
    afterSlots = generateTimeSlots(14, 0, 19, 0);
  }

  renderSlotGrid('morningSlotsGrid', mornSlots, booked);

  const afternoonPeriod = document.getElementById('afternoonPeriod');
  if (afternoonPeriod) {
    if (afterSlots.length > 0) {
      afternoonPeriod.style.display = 'block';
      renderSlotGrid('afternoonSlotsGrid', afterSlots, booked);
    } else {
      afternoonPeriod.style.display = 'none';
    }
  }
}

/**
 * Renderiza o grid de slots em um container.
 * @param {string} containerId
 * @param {string[]} slots   - Array de horários "HH:MM"
 * @param {string[]} booked  - Array de horários ocupados
 */
function renderSlotGrid(containerId, slots, booked) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (slots.length === 0) {
    container.innerHTML = `<p style="font-size:13px;color:var(--text-muted);grid-column:1/-1;">${t('slots.noSlots')}</p>`;
    return;
  }

  container.innerHTML = slots.map(time => {
    const isBooked   = booked.includes(time);
    const isSelected = AppState.selectedTime === time;
    let cls = 'time-slot';
    if (isBooked)   cls += ' booked';
    else if (isSelected) cls += ' selected-slot';

    return `
      <button
        class="${cls}"
        onclick="${isBooked ? '' : `selectTimeSlot('${time}', this)`}"
        aria-label="${time}${isBooked ? ' — ocupado' : ''}"
        aria-pressed="${isSelected}"
        ${isBooked ? 'disabled aria-disabled="true"' : ''}
        title="${isBooked ? t('legend.booked') : t('legend.free')}"
      >${time}</button>
    `;
  }).join('');
}

/**
 * Seleciona um horário disponível e abre o modal de confirmação.
 * @param {string} time  - "HH:MM"
 * @param {HTMLElement} el - Botão clicado
 */
function selectTimeSlot(time, el) {
  AppState.selectedTime = time;

  /* Remove seleção anterior */
  document.querySelectorAll('.time-slot.selected-slot').forEach(btn => {
    btn.classList.remove('selected-slot');
    btn.setAttribute('aria-pressed', 'false');
  });

  el.classList.add('selected-slot');
  el.setAttribute('aria-pressed', 'true');

  /* Abre modal de agendamento */
  openBookingModal();
}

/**
 * Oculta o painel de slots e volta ao estado inicial.
 */
function hideSlotsPanel() {
  const placeholder = document.getElementById('slotsPlaceholder');
  const content     = document.getElementById('slotsContent');
  if (placeholder) placeholder.style.display = '';
  if (content)     content.style.display = 'none';
}

/* ------------------------------------------------------------
   SEÇÃO 7: MÓDULO DE AGENDAMENTO (MODAL + CONFIRMAÇÃO)
   Gerencia abertura, preenchimento e confirmação do modal de booking.
   INTEGRAÇÃO BACK-END: POST /api/appointments
   Body: { clientId?, clientName, clientPhone, date, time, services[], notes, barberId? }
   Resposta 201: { id, status: 'confirmed' }
   ------------------------------------------------------------ */

/**
 * Preenche os dados do resumo e abre o modal de agendamento.
 */
function openBookingModal() {
  if (!AppState.selectedDate || !AppState.selectedTime) return;

  const date = AppState.selectedDate;
  const months   = t('months');
  const weekdays = t('weekdays.short');

  const dateFormatted = `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  const dayName = weekdays[date.getDay()];
  const monthName = months[date.getMonth()];

  /* Preenche resumo */
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const summaryDay  = document.getElementById('summaryDay');
  const modalSub    = document.getElementById('bookingModalDatetime');

  if (summaryDate) summaryDate.textContent = dateFormatted;
  if (summaryTime) summaryTime.textContent = AppState.selectedTime;
  if (summaryDay)  summaryDay.textContent  = dayName;
  if (modalSub)    modalSub.textContent    = `${dayName}, ${date.getDate()} de ${monthName} • ${AppState.selectedTime}`;

  /* Pré-preenche nome do usuário logado */
  const currentUser = getCurrentUser();
  const nameInput   = document.getElementById('clientName');
  const phoneInput  = document.getElementById('clientPhone');
  if (nameInput && currentUser?.name && !nameInput.value)  nameInput.value  = currentUser.name;
  if (phoneInput && currentUser?.phone && !phoneInput.value) phoneInput.value = currentUser.phone;

  /* Limpa validação anterior */
  const errEl = document.getElementById('bookingValidationMsg');
  if (errEl) errEl.style.display = 'none';

  openModal('bookingModal');
}

function closeBookingModal() {
  closeModal('bookingModal');
}

/**
 * Confirma o agendamento: valida dados, salva no store e notifica a API.
 */
async function confirmBooking() {
  const services = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(i => i.value);
  const name     = document.getElementById('clientName')?.value.trim() || '';
  const phone    = document.getElementById('clientPhone')?.value.trim() || '';
  const notes    = document.getElementById('clientNotes')?.value.trim() || '';
  const errEl    = document.getElementById('bookingValidationMsg');
  const btn      = document.getElementById('confirmBookingBtn');

  /* Validação */
  if (services.length === 0) {
    if (errEl) { errEl.textContent = t('modal.book.validation.services'); errEl.style.display = 'block'; }
    return;
  }
  if (!name) {
    if (errEl) { errEl.textContent = t('modal.book.validation.name'); errEl.style.display = 'block'; }
    return;
  }
  if (errEl) errEl.style.display = 'none';

  /* Loading */
  if (btn) { btn.disabled = true; btn.textContent = '⏳'; }

  const date = AppState.selectedDate;
  const dateFormatted = `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  const dateKey  = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
  const weekdays = t('weekdays.short');
  const dayShort = weekdays[date.getDay()];

  const serviceLabels = { cabelo: t('service.hair'), barba: t('service.beard'), sobrancelha: t('service.eyebrow') };

  /* INTEGRAÇÃO BACK-END:
     const token = localStorage.getItem('authToken');
     const res = await fetch(`${BASE_API_URL}/appointments`, {
       method: 'POST',
       headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + token },
       body: JSON.stringify({ clientName: name, clientPhone: phone, date: dateKey, time: AppState.selectedTime, services, notes })
     });
     if (!res.ok) { showToast(t('toast.error.generic'), 'error'); btn.disabled = false; return; }
     const created = await res.json();
  */

  /* Simulação (remover em produção) */
  await new Promise(r => setTimeout(r, 800));

  const newAppt = {
    id:          'appt_' + Date.now(),
    clientName:  name,
    clientPhone: phone.replace(/\D/g,''),
    date:        dateFormatted,
    day:         dayShort,
    time:        AppState.selectedTime,
    services:    services.map(s => serviceLabels[s] || s),
    status:      'confirmed',
    notes:       notes,
    dateKey:     dateKey
  };

  /* Adiciona ao store */
  if (!window.appointmentsStore) window.appointmentsStore = [];
  window.appointmentsStore.unshift(newAppt);

  /* Marca slot como ocupado */
  if (!window.bookedSlotsStore) window.bookedSlotsStore = {};
  if (!window.bookedSlotsStore[dateKey]) window.bookedSlotsStore[dateKey] = [];
  window.bookedSlotsStore[dateKey].push(AppState.selectedTime);

  /* Atualiza UI */
  closeBookingModal();
  showToast(t('modal.book.success'), 'success');

  /* Recarrega slots mostrando o novo como ocupado */
  if (AppState.selectedDate) {
    loadAndRenderSlots(date.getFullYear(), date.getMonth(), date.getDate());
    renderCalendar();
  }

  /* Atualiza lista de agendamentos */
  renderMyAppointments();
  updateMyAppointmentsBadge();

  /* Restaura botão */
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${t('btn.confirm')}`;
  }
}

/* ------------------------------------------------------------
   SEÇÃO 8: MÓDULO DE MEUS AGENDAMENTOS
   Renderiza, filtra e gerencia os agendamentos do cliente.
   INTEGRAÇÃO BACK-END:
     GET    /api/appointments?clientId={id}       → listar
     DELETE /api/appointments/{id}                → cancelar
     PATCH  /api/appointments/{id}                → reagendar { date, time }
   ------------------------------------------------------------ */

let myAppointmentsFilter = 'all';

/**
 * Renderiza a lista de agendamentos do cliente logado.
 */
function renderMyAppointments() {
  const list    = document.getElementById('myAppointmentsList');
  const emptyEl = document.getElementById('myApptsEmpty');
  if (!list) return;

  /* INTEGRAÇÃO BACK-END:
     const token = localStorage.getItem('authToken');
     const res = await fetch(`${BASE_API_URL}/appointments?clientId=me`, { headers: { Authorization: 'Bearer ' + token } });
     const data = await res.json();
     window.appointmentsStore = data;
  */

  let data = (window.appointmentsStore || []).filter(a => {
    if (myAppointmentsFilter === 'all') return true;
    return a.status === myAppointmentsFilter;
  });

  /* Remove cards antigos (mantém o empty state) */
  list.querySelectorAll('.my-appt-card').forEach(c => c.remove());

  if (data.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  const statusLabels  = {
    confirmed: t('status.confirmed'),
    pending:   t('status.pending'),
    cancelled: t('status.cancelled')
  };

  const serviceIconMap = { 'Cabelo':'💈','Barba':'🪒','Sobrancelha':'✨','Hair':'💈','Beard':'🪒','Eyebrow':'✨','Cabello':'💈','Ceja':'✨' };

  data.forEach(appt => {
    const card = document.createElement('article');
    card.className = `my-appt-card${appt.status === 'cancelled' ? ' cancelled' : ''}`;
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-appointment-id', appt.id);

    card.innerHTML = `
      <div class="my-appt-status ${appt.status}" aria-label="Status: ${statusLabels[appt.status]||appt.status}"></div>
      <div class="appt-time-block">
        <div class="appt-time">${appt.time}</div>
        <div class="appt-day">${appt.day}</div>
      </div>
      <div class="appt-divider" aria-hidden="true"></div>
      <div class="appt-info flex-1">
        <div class="appt-client">${escapeHtml(appt.date)}</div>
        <div class="appt-services">
          ${appt.services.map(s=>`<span class="service-tag">${serviceIconMap[s]||''} ${s}</span>`).join('')}
        </div>
        ${appt.notes ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">📝 ${escapeHtml(appt.notes)}</div>` : ''}
      </div>
      <div style="font-size:11px;color:var(--text-muted);text-align:right;flex-shrink:0;">
        <span class="status-badge ${appt.status}">${statusLabels[appt.status]||appt.status}</span>
      </div>
      ${appt.status !== 'cancelled' ? `
        <div class="appt-actions" style="flex-shrink:0;">
          <button class="btn btn-sm btn-secondary" onclick="rescheduleAppointment('${appt.id}')" aria-label="${t('btn.rescheduleConfirm')}">${t('btn.rescheduleConfirm').split(' ')[0]}</button>
          <button class="btn btn-sm btn-danger"    onclick="cancelAppointment('${appt.id}')"     aria-label="${t('btn.cancelConfirm')}">${t('btn.cancel')}</button>
        </div>
      ` : ''}
    `;
    list.appendChild(card);
  });
}

/**
 * Filtra a lista de agendamentos do cliente.
 * @param {string} filter - 'all'|'confirmed'|'cancelled'
 * @param {HTMLElement} btn - Botão clicado (para ativar estilo)
 */
function filterMyAppointments(filter, btn) {
  myAppointmentsFilter = filter;
  /* Atualiza estilo dos botões de filtro */
  document.querySelectorAll('[data-filter]').forEach(b => {
    b.className = b.dataset.filter === filter ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    b.setAttribute('aria-selected', String(b.dataset.filter === filter));
  });
  renderMyAppointments();
}

/**
 * Atualiza o badge de contagem de agendamentos ativos.
 */
function updateMyAppointmentsBadge() {
  const badge = document.getElementById('myAppointmentsBadge');
  if (!badge) return;
  const active = (window.appointmentsStore||[]).filter(a => a.status !== 'cancelled').length;
  badge.textContent = active;
  badge.style.display = active > 0 ? '' : 'none';
}

/**
 * Abre o modal de cancelamento para o agendamento especificado.
 * @param {string} id
 */
function cancelAppointment(id) {
  const appt = (window.appointmentsStore||[]).find(a => a.id === id);
  if (!appt) return;
  AppState.appointmentToCancel = id;

  const detailsEl = document.getElementById('cancelApptDetails');
  if (detailsEl) {
    const serviceIconMap = { 'Cabelo':'💈','Barba':'🪒','Sobrancelha':'✨','Hair':'💈','Beard':'🪒','Eyebrow':'✨','Cabello':'💈','Ceja':'✨' };
    detailsEl.innerHTML = `
      <strong>${escapeHtml(appt.clientName)}</strong><br/>
      📅 ${appt.date} &nbsp;⏰ ${appt.time}<br/>
      ${appt.services.map(s=>`<span class="service-tag">${serviceIconMap[s]||''} ${s}</span>`).join('')}
    `;
  }
  openModal('cancelModal');
}

function closeCancelModal() {
  AppState.appointmentToCancel = null;
  closeModal('cancelModal');
}

/**
 * Executa o cancelamento: marca o agendamento como cancelado e libera o slot.
 * INTEGRAÇÃO BACK-END: DELETE /api/appointments/{id}
 */
async function executeCancellation() {
  const id   = AppState.appointmentToCancel;
  const btn  = document.getElementById('confirmCancelBtn');
  if (!id) return;

  if (btn) { btn.disabled = true; btn.textContent = '⏳'; }

  /* INTEGRAÇÃO BACK-END:
     const token = localStorage.getItem('authToken');
     const res = await fetch(`${BASE_API_URL}/appointments/${id}`, {
       method: 'DELETE',
       headers: { Authorization: 'Bearer ' + token }
     });
     if (!res.ok) { showToast(t('toast.error.generic'), 'error'); btn.disabled = false; return; }
  */
  await new Promise(r => setTimeout(r, 600));

  /* Atualiza store */
  const appt = (window.appointmentsStore||[]).find(a => a.id === id);
  if (appt) {
    appt.status = 'cancelled';
    /* Libera slot — volta a ficar "branco" (livre) */
    if (appt.dateKey && window.bookedSlotsStore?.[appt.dateKey]) {
      window.bookedSlotsStore[appt.dateKey] = window.bookedSlotsStore[appt.dateKey].filter(t => t !== appt.time);
    }
  }

  closeCancelModal();
  showToast(t('toast.cancelSuccess'), 'success');
  renderMyAppointments();
  updateMyAppointmentsBadge();
  renderCalendar();

  /* Recarrega slots se o dia cancelado ainda estiver selecionado */
  if (AppState.selectedDate && appt?.dateKey) {
    const d = AppState.selectedDate;
    const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (key === appt.dateKey) loadAndRenderSlots(d.getFullYear(), d.getMonth(), d.getDate());
  }

  if (btn) { btn.disabled = false; btn.textContent = t('btn.cancelConfirm'); }
}

/**
 * Abre o modal de reagendamento.
 * @param {string} id
 */
function rescheduleAppointment(id) {
  AppState.appointmentToReschedule = id;
  AppState.rescheduleDate = null;
  AppState.rescheduleTime = null;

  /* Renderiza mini-calendário de reagendamento */
  const container = document.getElementById('rescheduleCalendarContainer');
  if (container) {
    container.innerHTML = `
      <p style="font-size:14px;color:var(--text-muted);margin-bottom:16px;" data-i18n="modal.reschedule.subtitle">${t('modal.reschedule.subtitle')}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;">
        <div>
          <div class="calendar-nav" style="margin-bottom:8px;">
            <button class="calendar-nav-btn" onclick="changeRescheduleMonth(-1)">&#8249;</button>
            <span class="calendar-month-label" id="rescheduleMonthLabel"></span>
            <button class="calendar-nav-btn" onclick="changeRescheduleMonth(1)">&#8250;</button>
          </div>
          <div class="calendar-grid" style="width:220px;">
            <div class="calendar-day-header">D</div><div class="calendar-day-header">S</div>
            <div class="calendar-day-header">T</div><div class="calendar-day-header">Q</div>
            <div class="calendar-day-header">Q</div><div class="calendar-day-header">S</div>
            <div class="calendar-day-header">S</div>
            <div id="rescheduleCalGrid" style="display:contents;"></div>
          </div>
        </div>
        <div id="rescheduleSlots" style="flex:1;min-width:200px;"></div>
      </div>
    `;
    AppState.rescheduleCalYear  = AppState.calendarYear;
    AppState.rescheduleCalMonth = AppState.calendarMonth;
    renderRescheduleCalendar();
  }

  const confirmBtn = document.getElementById('confirmRescheduleBtn');
  if (confirmBtn) confirmBtn.disabled = true;

  openModal('rescheduleModal');
}

function closeRescheduleModal() {
  AppState.appointmentToReschedule = null;
  closeModal('rescheduleModal');
}

function changeRescheduleMonth(dir) {
  AppState.rescheduleCalMonth += dir;
  if (AppState.rescheduleCalMonth < 0)  { AppState.rescheduleCalMonth = 11; AppState.rescheduleCalYear--; }
  if (AppState.rescheduleCalMonth > 11) { AppState.rescheduleCalMonth = 0;  AppState.rescheduleCalYear++; }
  renderRescheduleCalendar();
}

function renderRescheduleCalendar() {
  const grid  = document.getElementById('rescheduleCalGrid');
  const label = document.getElementById('rescheduleMonthLabel');
  if (!grid || !label) return;

  const year   = AppState.rescheduleCalYear;
  const month  = AppState.rescheduleCalMonth;
  const today  = new Date();
  const months = t('months');
  label.textContent = `${months[month]} ${year}`;

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  grid.innerHTML    = '';

  for (let i = 0; i < firstDay; i++) {
    const e = document.createElement('div');
    e.className = 'calendar-day other-month';
    e.setAttribute('aria-hidden', 'true');
    grid.appendChild(e);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d   = new Date(year, month, day);
    const dow = d.getDay();
    const isPast    = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isWorkday = BUSINESS_DAYS.includes(dow);
    const isSelected = AppState.rescheduleDate &&
                       AppState.rescheduleDate.getDate() === day &&
                       AppState.rescheduleDate.getMonth() === month &&
                       AppState.rescheduleDate.getFullYear() === year;

    let cls = ['calendar-day'];
    if (!isWorkday || isPast) cls.push('disabled');
    if (isSelected) cls.push('selected');

    const cell = document.createElement('div');
    cell.className = cls.join(' ');
    cell.textContent = day;
    if (isWorkday && !isPast) {
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', () => selectRescheduleDay(year, month, day));
    }
    grid.appendChild(cell);
  }
}

async function selectRescheduleDay(year, month, day) {
  AppState.rescheduleDate = new Date(year, month, day);
  AppState.rescheduleTime = null;
  renderRescheduleCalendar();

  const dateKey  = formatDateKey(year, month, day);
  const date     = new Date(year, month, day);
  const dow      = date.getDay();
  const booked   = window.bookedSlotsStore?.[dateKey] || [];

  let slots = [];
  if (dow === 6) slots = generateTimeSlots(8, 0, 12, 0);
  else { slots = [...generateTimeSlots(9, 0, 12, 0), ...generateTimeSlots(14, 0, 19, 0)]; }

  const slotsEl = document.getElementById('rescheduleSlots');
  if (!slotsEl) return;

  slotsEl.innerHTML = `
    <div class="slots-period-label">${t('slots.morning')}</div>
    <div class="slots-grid" style="grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));">
      ${slots.map(time => {
        const isBooked = booked.includes(time);
        return `<button class="time-slot${isBooked?' booked':''}" onclick="${isBooked?'':''}" ${isBooked?'disabled':''} onclick="selectRescheduleTime('${time}', this)">${time}</button>`;
      }).join('')}
    </div>
  `;

  /* Corrige onclick após render */
  slotsEl.querySelectorAll('.time-slot:not(.booked)').forEach(btn => {
    btn.onclick = () => selectRescheduleTime(btn.textContent.trim(), btn);
  });

  const confirmBtn = document.getElementById('confirmRescheduleBtn');
  if (confirmBtn) confirmBtn.disabled = true;
}

function selectRescheduleTime(time, el) {
  AppState.rescheduleTime = time;
  document.querySelectorAll('#rescheduleSlots .time-slot').forEach(b => b.classList.remove('selected-slot'));
  el.classList.add('selected-slot');
  const confirmBtn = document.getElementById('confirmRescheduleBtn');
  if (confirmBtn) confirmBtn.disabled = false;
}

/**
 * Executa o reagendamento.
 * INTEGRAÇÃO BACK-END: PATCH /api/appointments/{id} { date, time }
 */
async function executeReschedule() {
  const id   = AppState.appointmentToReschedule;
  const date = AppState.rescheduleDate;
  const time = AppState.rescheduleTime;
  if (!id || !date || !time) return;

  const btn = document.getElementById('confirmRescheduleBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳'; }

  /* INTEGRAÇÃO BACK-END:
     const token = localStorage.getItem('authToken');
     const dateKey = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
     await fetch(`${BASE_API_URL}/appointments/${id}`, {
       method: 'PATCH',
       headers: { 'Content-Type':'application/json', Authorization: 'Bearer '+token },
       body: JSON.stringify({ date: dateKey, time })
     });
  */
  await new Promise(r => setTimeout(r, 700));

  const appt = (window.appointmentsStore||[]).find(a => a.id === id);
  if (appt) {
    /* Libera slot antigo */
    if (appt.dateKey && window.bookedSlotsStore?.[appt.dateKey]) {
      window.bookedSlotsStore[appt.dateKey] = window.bookedSlotsStore[appt.dateKey].filter(t => t !== appt.time);
    }
    /* Atualiza para novo slot */
    const newKey = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
    const weekdays = t('weekdays.short');
    appt.time    = time;
    appt.date    = `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
    appt.day     = weekdays[date.getDay()];
    appt.dateKey = newKey;
    appt.status  = 'confirmed';

    if (!window.bookedSlotsStore[newKey]) window.bookedSlotsStore[newKey] = [];
    window.bookedSlotsStore[newKey].push(time);
  }

  closeRescheduleModal();
  showToast(t('toast.rescheduleSuccess'), 'success');
  renderMyAppointments();
  updateMyAppointmentsBadge();
  renderCalendar();

  if (btn) { btn.disabled = false; btn.textContent = t('btn.rescheduleConfirm'); }
}

/* ------------------------------------------------------------
   SEÇÃO 9: MÓDULO DE TOAST / NOTIFICAÇÕES
   Exibe mensagens de feedback ao usuário.
   INTEGRAÇÃO BACK-END: Disparar após callbacks de fetch (onSuccess, onError).
   ------------------------------------------------------------ */

/**
 * Exibe um toast de notificação.
 * @param {string} message - Texto da mensagem
 * @param {'success'|'error'|'info'} type
 * @param {number} [duration=4000] - Duração em ms
 */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span style="font-size:18px;flex-shrink:0;" aria-hidden="true">${icons[type]||'ℹ️'}</span>
    <span style="flex:1;">${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()" style="color:var(--text-muted);font-size:16px;padding:0 4px;cursor:pointer;background:none;border:none;" aria-label="Fechar">✕</button>
  `;

  container.appendChild(toast);

  /* Remove automaticamente após duração */
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ------------------------------------------------------------
   SEÇÃO 10: MÓDULO DE MODAL GENÉRICO
   Funções utilitárias para abrir/fechar qualquer modal.
   ------------------------------------------------------------ */

/**
 * Abre um modal pelo ID.
 * @param {string} modalId
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('open');
  modal.focus();
  /* Bloqueia scroll do body */
  document.body.style.overflow = 'hidden';
  /* Fecha com ESC */
  const escHandler = (e) => {
    if (e.key === 'Escape') { closeModal(modalId); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Fecha um modal pelo ID.
 * @param {string} modalId
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ------------------------------------------------------------
   SEÇÃO 11: MÓDULO DE SIDEBAR (MOBILE)
   Controla abertura e fechamento da sidebar em dispositivos móveis.
   ------------------------------------------------------------ */

/**
 * Alterna a visibilidade da sidebar (mobile).
 */
function toggleSidebar() {
  const sidebar  = document.getElementById('mainSidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const toggleBtn = document.getElementById('menuToggleBtn');
  if (!sidebar) return;

  const isOpen = sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open', isOpen);
  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(isOpen));
}

/* ------------------------------------------------------------
   SEÇÃO 12: MÓDULO DE USUÁRIO
   Lê e gerencia os dados do usuário logado do localStorage.
   INTEGRAÇÃO BACK-END: GET /api/auth/me → { id, name, email, phone, role }
   ------------------------------------------------------------ */

/**
 * Retorna o objeto do usuário atual do localStorage.
 * @returns {Object|null}
 */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  } catch {
    return null;
  }
}

/**
 * Preenche os elementos de nome/avatar do usuário logado na sidebar e hero.
 */
function populateUserInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const initials = (user.name || 'U')
    .split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const nameEls   = document.querySelectorAll('#sidebarUserName, #heroUserName');
  const avatarEls = document.querySelectorAll('#sidebarAvatarInitials');

  nameEls.forEach(el => { if (el) el.textContent = user.name || 'Usuário'; });
  avatarEls.forEach(el => { if (el) el.textContent = initials; });
}

/* ------------------------------------------------------------
   SEÇÃO 13: MÓDULO DE SCROLL HELPERS
   Utilitários de navegação interna na página.
   ------------------------------------------------------------ */

/**
 * Scrola suavemente até uma seção pelo ID.
 * @param {string} sectionId
 */
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    const offset = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

/* ------------------------------------------------------------
   SEÇÃO 14: FUNÇÕES UTILITÁRIAS
   ------------------------------------------------------------ */

/**
 * Formata uma chave de data no formato "YYYY-MM-DD".
 */
function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

/**
 * Escapa HTML para prevenir XSS ao inserir strings dinâmicas no DOM.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Atualiza a lista de agendamentos a partir do servidor.
 * INTEGRAÇÃO BACK-END: GET /api/appointments?clientId=me
 */
function refreshMyAppointments() {
  showToast(AppState.currentLang === 'pt' ? 'Atualizando...' : AppState.currentLang === 'en' ? 'Refreshing...' : 'Actualizando...', 'info', 1500);
  renderMyAppointments();
  updateMyAppointmentsBadge();
}

/* ------------------------------------------------------------
   SEÇÃO 15: INICIALIZAÇÃO GLOBAL
   Executada no DOMContentLoaded. Inicializa tema, idioma, calendário e dados.
   ------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', function () {

  /* 1. Aplica tema salvo */
  applyTheme(AppState.currentTheme);

  /* 2. Aplica idioma salvo e traduz a página */
  applyTranslations();

  /* 3. Sincroniza o seletor de idioma com o estado atual */
  const flags  = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' };
  const labels = { pt: 'PT',   en: 'EN',  es: 'ES'  };
  const flagEl  = document.getElementById('currentFlag');
  const labelEl = document.getElementById('currentLangLabel');
  if (flagEl)  flagEl.textContent  = flags[AppState.currentLang];
  if (labelEl) labelEl.textContent = labels[AppState.currentLang];

  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.lang === AppState.currentLang);
  });

  /* 4. Renderiza calendário (apenas em inicio.html) */
  if (document.getElementById('calendarDaysGrid')) {
    renderCalendar();
  }

  /* 5. Popula dados do usuário na UI */
  populateUserInfo();

  /* 6. Renderiza agendamentos do cliente (apenas em inicio.html) */
  if (document.getElementById('myAppointmentsList')) {
    renderMyAppointments();
    updateMyAppointmentsBadge();
  }

  /* 7. Exibe próximo agendamento no Hero (apenas em inicio.html) */
  if (document.getElementById('nextApptCard')) {
    const active = (window.appointmentsStore||[]).filter(a => a.status === 'confirmed');
    if (active.length > 0) {
      const next = active[0];
      const card = document.getElementById('nextApptCard');
      if (card) {
        card.style.display = 'block';
        const timeEl = document.getElementById('nextApptTime');
        const dayEl  = document.getElementById('nextApptDay');
        const svcEl  = document.getElementById('nextApptServices');
        if (timeEl) timeEl.textContent = next.time;
        if (dayEl)  dayEl.textContent  = next.day;
        if (svcEl)  svcEl.textContent  = next.services.join(' + ');
      }
    }
  }

  /* 8. Fecha dropdowns ao clicar fora */
  document.addEventListener('click', function (e) {
    const langSelector = document.getElementById('langSelector');
    const langDropdown = document.getElementById('langDropdown');
    if (langDropdown && langSelector && !langSelector.contains(e.target)) {
      langDropdown.classList.remove('open');
      const btn = document.getElementById('langBtn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    /* Fecha modais ao clicar no overlay */
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* 9. Inicializa data atual nos campos de data dos modais */
  const today = new Date();
  const pad   = n => String(n).padStart(2,'0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    if (!input.min) input.min = todayStr;
  });

  /* 10. Marca nav item ativo baseado na URL */
  const currentPage = window.location.pathname.split('/').pop().replace('.html','') || 'inicio';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === currentPage);
  });

  /* 11. Popula badge do header do dashboard com data (se elemento existir) */
  const dateHeader = document.getElementById('currentDateHeader');
  if (dateHeader) {
    const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
    const str  = today.toLocaleDateString(AppState.currentLang === 'pt' ? 'pt-BR' : AppState.currentLang === 'en' ? 'en-US' : 'es-ES', opts);
    dateHeader.textContent = str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* 12. Acessibilidade: foco visível em modal ao abrir */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('transitionend', () => {
      if (overlay.classList.contains('open')) {
        const firstFocusable = overlay.querySelector('input, button, select, [tabindex="0"]');
        if (firstFocusable) firstFocusable.focus();
      }
    });
  });

  /* INTEGRAÇÃO BACK-END — Verificação de autenticação:
     const token = localStorage.getItem('authToken');
     const protectedPages = ['inicio.html', 'dashboard.html'];
     const isProtected = protectedPages.some(p => window.location.pathname.endsWith(p));
     if (isProtected && !token) window.location.href = 'login.html';

     Validação do token:
     if (token) {
       fetch(BASE_API_URL + '/auth/me', { headers: { Authorization: 'Bearer ' + token } })
         .then(r => r.ok ? r.json() : null)
         .then(user => {
           if (!user) { localStorage.clear(); window.location.href = 'login.html'; }
           else {
             localStorage.setItem('currentUser', JSON.stringify(user));
             populateUserInfo();
           }
         });
     }
  */
});

/* ------------------------------------------------------------
   SEÇÃO 16: EXPORT GLOBAL PARA USO NOS HTML INLINE SCRIPTS
   Expõe funções necessárias nos handlers onclick do HTML.
   ------------------------------------------------------------ */

/* As funções abaixo já estão no escopo global por não usar módulos ES6.
   Se migrar para ES Modules (type="module"), exportar explicitamente:

   export {
     toggleTheme, toggleLangDropdown, setLanguage,
     toggleSidebar, changeMonth, selectCalendarDay,
     selectTimeSlot, openBookingModal, closeBookingModal, confirmBooking,
     cancelAppointment, closeCancelModal, executeCancellation,
     rescheduleAppointment, closeRescheduleModal, executeReschedule,
     filterMyAppointments, refreshMyAppointments, scrollToSection,
     showToast, openModal, closeModal, escapeHtml
   };
*/

/* ============================================================
   FIM DO SCRIPT.JS — ZYNTEK BARBERSHOP MANAGEMENT SYSTEM
   Desenvolvido pela Zyntek | barberpro.com.br
   ============================================================ */