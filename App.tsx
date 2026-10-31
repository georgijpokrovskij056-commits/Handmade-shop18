import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Download,
  KeyRound,
  LogOut,
  Menu,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { products, formatPrice, type Category, type Product } from './data'
import { DiamondDivider, OrnamentBand, OrnamentStar } from './components/Ornament'
import { useAuth } from './hooks/useAuth'
import { trpc } from './providers/trpc'
import './App.css'

type Cart = Record<string, number>
type Filter = 'Все' | Category

const filters: Filter[] = ['Все', 'Доски', 'Утварь', 'Мебель']

function Modal({
  open,
  onClose,
  label,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  className: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={className}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {children}
    </dialog>
  )
}

function AccountDialog({
  open,
  onClose,
  onToast,
}: {
  open: boolean
  onClose: () => void
  onToast: (message: string) => void
}) {
  const { user, isLoading, logout } = useAuth({ redirectPath: '/' })
  const utils = trpc.useUtils()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: async () => {
      setPassword('')
      setFormError('')
      await utils.auth.me.invalidate()
      onToast('Вы вошли в личный кабинет')
    },
    onError: (error) => setFormError(error.message),
  })

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: async () => {
      setPassword('')
      setConfirmPassword('')
      setFormError('')
      await utils.auth.me.invalidate()
      onToast('Регистрация завершена')
    },
    onError: (error) => setFormError(error.message),
  })

  const changePasswordMutation = trpc.localAuth.changePassword.useMutation({
    onSuccess: async () => {
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
      setPasswordError('')
      setPasswordSaved(true)
      await utils.auth.me.invalidate()
      onToast('Пароль изменён')
    },
    onError: (error) => {
      setPasswordSaved(false)
      setPasswordError(error.message)
    },
  })

  const adminUsers = trpc.localAuth.users.useQuery(undefined, {
    enabled: open && user?.role === 'admin',
    retry: false,
  })

  const closeAccount = () => {
    setMode('login')
    setName('')
    setIdentifier('')
    setPassword('')
    setConfirmPassword('')
    setFormError('')
    setCurrentPassword('')
    setNewPassword('')
    setNewPasswordConfirm('')
    setPasswordError('')
    setPasswordSaved(false)
    onClose()
  }

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode)
    setFormError('')
    setPassword('')
    setConfirmPassword('')
  }

  const submitAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (mode === 'register') {
      if (password.length < 8) {
        setFormError('Пароль должен содержать не менее 8 символов')
        return
      }
      if (password !== confirmPassword) {
        setFormError('Пароли не совпадают')
        return
      }
      registerMutation.mutate({ name, identifier, password })
      return
    }
    loginMutation.mutate({ identifier, password })
  }

  const submitPasswordChange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordSaved(false)
    if (newPassword.length < 8) {
      setPasswordError('Новый пароль должен содержать не менее 8 символов')
      return
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Новые пароли не совпадают')
      return
    }
    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  const authPending = loginMutation.isPending || registerMutation.isPending
  const loginLabel = user?.email || user?.phone || ''

  return (
    <Modal open={open} onClose={closeAccount} label={user ? 'Личный кабинет' : 'Вход и регистрация'} className="account-dialog">
      <button className="dialog-close account-close" onClick={closeAccount} aria-label="Закрыть личный кабинет"><X size={22} /></button>
      {isLoading && !user ? (
        <div className="account-loading" role="status">Загружаем данные аккаунта…</div>
      ) : user ? (
        <div className="account-content">
          <div className="account-profile-heading">
            <p className="eyebrow">Личный кабинет</p>
            <h2>{user.name || 'Добро пожаловать'}</h2>
            <p>{loginLabel}</p>
            {user.role === 'admin' && <span className="role-badge"><ShieldCheck size={15} /> Администратор</span>}
          </div>

          {user.mustChangePassword && (
            <div className="password-warning" role="alert">
              <KeyRound size={21} />
              <div><strong>Смените временный пароль</strong><p>Для безопасности задайте собственный пароль перед дальнейшей работой.</p></div>
            </div>
          )}

          {user.hasPassword && (
            <details className="password-section" open={user.mustChangePassword}>
              <summary><span><KeyRound size={18} /> Сменить пароль</span><Plus size={18} /></summary>
              <form className="account-form password-form" onSubmit={submitPasswordChange}>
                <label htmlFor="current-password">Текущий пароль</label>
                <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required maxLength={72} />
                <label htmlFor="new-password">Новый пароль</label>
                <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} maxLength={72} aria-describedby="new-password-hint" />
                <small id="new-password-hint">Не менее 8 символов</small>
                <label htmlFor="new-password-confirm">Повторите новый пароль</label>
                <input id="new-password-confirm" type="password" autoComplete="new-password" value={newPasswordConfirm} onChange={(event) => setNewPasswordConfirm(event.target.value)} required minLength={8} maxLength={72} />
                {passwordError && <p className="form-error" role="alert">{passwordError}</p>}
                {passwordSaved && <p className="form-success" role="status">Новый пароль сохранён.</p>}
                <button className="primary-link account-submit" type="submit" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? 'Сохраняем…' : 'Сохранить новый пароль'}
                </button>
              </form>
            </details>
          )}

          {user.role === 'admin' && (
            <section className="admin-section" aria-labelledby="admin-users-title">
              <div className="admin-heading">
                <div><p className="eyebrow">Управление</p><h3 id="admin-users-title">Пользователи</h3></div>
                {adminUsers.data && <span>{adminUsers.data.length}</span>}
              </div>
              {adminUsers.isLoading ? (
                <p className="admin-status" role="status">Загружаем список…</p>
              ) : adminUsers.error ? (
                <p className="form-error" role="alert">Не удалось загрузить список пользователей.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Имя</th><th>Логин</th><th>Роль</th><th>Регистрация</th></tr></thead>
                    <tbody>
                      {adminUsers.data?.map((registeredUser) => (
                        <tr key={registeredUser.id}>
                          <td>{registeredUser.name || 'Без имени'}</td>
                          <td>{registeredUser.email || registeredUser.phone || 'Kimi ID'}</td>
                          <td>{registeredUser.role === 'admin' ? 'Админ' : 'Пользователь'}</td>
                          <td>{new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(registeredUser.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          <button className="logout-button" type="button" onClick={() => { switchMode('login'); logout() }} disabled={isLoading}><LogOut size={18} /> Выйти из аккаунта</button>
        </div>
      ) : (
        <div className="account-content auth-content">
          <p className="eyebrow">Дом 18 · личный кабинет</p>
          <h2>{mode === 'login' ? 'С возвращением' : 'Создайте аккаунт'}</h2>
          <p className="auth-intro">{mode === 'login' ? 'Войдите, чтобы управлять своим профилем.' : 'Зарегистрируйтесь по номеру телефона или адресу электронной почты.'}</p>
          <div className="auth-tabs" role="tablist" aria-label="Вход или регистрация">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Вход</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Регистрация</button>
          </div>
          <form className="account-form" onSubmit={submitAuth}>
            {mode === 'register' && (
              <>
                <label htmlFor="register-name">Ваше имя</label>
                <input id="register-name" name="name" type="text" autoComplete="name" placeholder="Как к вам обращаться" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} autoFocus />
              </>
            )}
            <label htmlFor="auth-identifier">{mode === 'login' ? 'Логин' : 'Телефон или электронная почта'}</label>
            <input
              id="auth-identifier"
              name="username"
              type="text"
              inputMode="text"
              autoComplete="username"
              placeholder="Введите номер телефона или адрес электронной почты"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              minLength={3}
              maxLength={320}
              autoFocus={mode === 'login'}
            />
            <label htmlFor="auth-password">Пароль</label>
            <input id="auth-password" name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'register' ? 'Не менее 8 символов' : 'Введите пароль'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={mode === 'register' ? 8 : 1} maxLength={72} />
            {mode === 'register' && (
              <>
                <label htmlFor="register-confirm">Повторите пароль</label>
                <input id="register-confirm" type="password" autoComplete="new-password" placeholder="Введите пароль ещё раз" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} maxLength={72} />
              </>
            )}
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="primary-link account-submit" type="submit" disabled={authPending}>
              {authPending ? 'Пожалуйста, подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'} <ArrowRight size={18} />
            </button>
          </form>
          <p className="auth-switch">
            {mode === 'login' ? 'Ещё нет аккаунта?' : 'Уже зарегистрированы?'}{' '}
            <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Создать аккаунт' : 'Войти'}</button>
          </p>
        </div>
      )}
    </Modal>
  )
}

function ProductCard({
  product,
  onOpen,
  onAdd,
}: {
  product: Product
  onOpen: () => void
  onAdd: () => void
}) {
  return (
    <article className="product-card">
      <button className="product-image-button" onClick={onOpen} aria-label={`Подробнее: ${product.name}`}>
        <span className="product-image-wrap">
          <img
            className="product-image product-image-primary"
            src={product.image}
            alt={product.name}
            loading="lazy"
            style={{ objectPosition: product.imagePosition }}
          />
          <img
            className="product-image product-image-alt"
            src={product.altImage}
            alt=""
            loading="lazy"
            aria-hidden="true"
          />
          <span className="product-view">Смотреть изделие <ArrowDownRight size={18} /></span>
        </span>
      </button>
      <div className="product-meta">
        <button className="product-name" onClick={onOpen}>{product.name}</button>
        <span className="product-price">{formatPrice(product.price)}</span>
      </div>
      <div className="product-bottom">
        <span>{product.category} · {product.material}</span>
        <button className="add-button" onClick={onAdd} aria-label={`Добавить в корзину: ${product.name}`}>
          <Plus size={18} /> <span>В корзину</span>
        </button>
      </div>
    </article>
  )
}

export default function App() {
  const { user } = useAuth({ redirectPath: '/' })
  const [activeFilter, setActiveFilter] = useState<Filter>('Все')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const heroImageRef = useRef<HTMLDivElement>(null)
  const [cart, setCart] = useState<Cart>(() => {
    try {
      const stored = localStorage.getItem('dom18-cart')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  const visibleProducts = useMemo(
    () => activeFilter === 'Все' ? products : products.filter((product) => product.category === activeFilter),
    [activeFilter],
  )

  const cartItems = products
    .filter((product) => (cart[product.id] ?? 0) > 0)
    .map((product) => ({ product, quantity: cart[product.id] }))
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  useEffect(() => {
    localStorage.setItem('dom18-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    document.body.style.overflow = cartOpen || accountOpen || selectedProduct || menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, accountOpen, selectedProduct, menuOpen])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return
    let frame = 0
    const update = () => {
      frame = 0
      if (heroImageRef.current) {
        const offset = Math.min(window.scrollY * 0.09, 72)
        heroImageRef.current.style.setProperty('--hero-y', `${offset}px`)
      }
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const addToCart = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }))
    setToast(`${product.name} — в корзине`)
  }

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + delta)
      const updated = { ...current }
      if (next === 0) delete updated[id]
      else updated[id] = next
      return updated
    })
  }

  const showCategory = (filter: Filter) => {
    setActiveFilter(filter)
    setMenuOpen(false)
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
  }

  const downloadOrder = () => {
    if (!cartItems.length) return
    const lines = [
      'ДОМ 18 — список выбранных изделий',
      '',
      ...cartItems.map(({ product, quantity }) =>
        `${product.name} — ${quantity} шт. × ${formatPrice(product.price)} = ${formatPrice(product.price * quantity)}`,
      ),
      '',
      `Итого: ${formatPrice(cartTotal)}`,
      '',
      'Цены и наличие изделий требуют подтверждения мастерской.',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dom-18-zakaz.txt'
    link.click()
    URL.revokeObjectURL(url)
    setToast('Список заказа сохранён')
  }

  return (
    <div id="top" className="site-shell">
      <a className="skip-link" href="#catalog">Перейти к каталогу</a>
      <div className="craft-note">Удмуртия <span>·</span> натуральное дерево <span>·</span> ручная работа</div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Дом 18 — на главную">
          <OrnamentStar className="brand-mark" />
          <span className="brand-type"><strong>ДОМ 18</strong><small>удмуртская мастерская</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <a href="#catalog">Каталог</a>
          <a href="#ornament">Орнамент</a>
          <a href="#workshop">Мастерская</a>
        </nav>
        <div className="header-actions">
          <button className="account-trigger" onClick={() => setAccountOpen(true)} aria-label={user ? `Личный кабинет: ${user.name || user.email || user.phone}` : 'Войти или зарегистрироваться'}>
            <UserRound size={20} strokeWidth={1.7} />
            <span>{user ? user.name?.split(' ')[0] || 'Профиль' : 'Войти'}</span>
          </button>
          <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Открыть корзину, товаров: ${cartCount}`}>
            <ShoppingBag size={20} strokeWidth={1.7} />
            <span>Корзина</span>
            <span className="cart-count" aria-hidden="true">{cartCount}</span>
          </button>
          <button className="menu-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}>
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Мобильная навигация">
          <a href="#catalog" onClick={() => setMenuOpen(false)}>Каталог <ArrowRight size={20} /></a>
          <a href="#ornament" onClick={() => setMenuOpen(false)}>Орнамент <ArrowRight size={20} /></a>
          <a href="#workshop" onClick={() => setMenuOpen(false)}>Мастерская <ArrowRight size={20} /></a>
        </nav>
      )}

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <OrnamentStar className="hero-star" outline />
            <p className="eyebrow">Предметы для дома из массива</p>
            <h1 id="hero-title">Дерево.<br />Руки.<br /><em>Характер.</em></h1>
            <p className="hero-description">Доски, кухонная утварь и мебель с удмуртским характером. Сохраняем живую фактуру дерева и добавляем ритм народного орнамента.</p>
            <a className="primary-link" href="#catalog">Смотреть изделия <ArrowDownRight size={20} /></a>
          </div>
          <div className="hero-visual">
            <div className="hero-image-parallax" ref={heroImageRef}>
              <img src="/images/boards-hero.webp" alt="Разделочные доски из тёмного и светлого дерева на кухонном столе" fetchPriority="high" />
            </div>
            <div className="hero-caption"><span>Орех + ясень</span><span>Ручная шлифовка</span></div>
            <span className="hero-number" aria-hidden="true">18</span>
          </div>
        </section>

        <OrnamentBand className="ornament-band" />

        <section id="catalog" className="catalog-section" aria-labelledby="catalog-title">
          <div className="section-heading catalog-heading">
            <div>
              <p className="eyebrow">Каталог мастерской</p>
              <h2 id="catalog-title">Из дерева —<br />для дома</h2>
            </div>
            <p>Небольшие серии и единичные вещи. У каждого изделия свой рисунок, оттенок и история.</p>
          </div>

          <div className="catalog-toolbar">
            <div className="filters" role="group" aria-label="Фильтр по категориям">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={activeFilter === filter ? 'filter active' : 'filter'}
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={activeFilter === filter}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span className="result-count">{visibleProducts.length} {visibleProducts.length === 1 ? 'изделие' : visibleProducts.length < 5 ? 'изделия' : 'изделий'}</span>
          </div>

          <div className="product-grid" aria-live="polite">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={() => setSelectedProduct(product)}
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
        </section>

        <section id="ornament" className="ornament-story" aria-labelledby="ornament-title">
          <div className="ornament-art">
            <OrnamentStar className="large-star" outline />
            <OrnamentStar className="small-star" />
            <span className="art-caption">Геометрия традиции<br />в современном доме</span>
          </div>
          <div className="ornament-copy">
            <p className="eyebrow">Фирменный орнамент</p>
            <h2 id="ornament-title">Узор, который говорит без слов</h2>
            <p>Ромбы, восьмилучевые звёзды и строгий ритм традиционной удмуртской вышивки стали основой нашего визуального языка.</p>
            <p>Орнамент появляется в декоративной резьбе, на текстиле и упаковке — не споря с деревом, а подчёркивая его происхождение.</p>
            <DiamondDivider className="diamond-divider" />
            <div className="pattern-legend" aria-label="Цвета орнамента">
              <span><i className="swatch swatch-red" />Красный</span>
              <span><i className="swatch swatch-dark" />Тёмный</span>
              <span><i className="swatch swatch-light" />Льняной</span>
            </div>
          </div>
        </section>

        <section className="furniture-feature" aria-labelledby="furniture-title">
          <div className="furniture-image">
            <img src="/images/bench.webp" alt="Скамья ручной работы из массива с природным живым краем" loading="lazy" />
            <span className="image-note">Массив · живая геометрия</span>
          </div>
          <div className="furniture-copy">
            <p className="eyebrow">Мебель на заказ</p>
            <h2 id="furniture-title">Сначала дерево.<br />Потом — размеры.</h2>
            <p>Подбираем слэб под ваш интерьер, сохраняем природный контур и предлагаем орнаментальную инкрустацию по желанию.</p>
            <button className="text-link" onClick={() => showCategory('Мебель')}>Смотреть мебель <ArrowRight size={20} /></button>
          </div>
        </section>

        <section id="workshop" className="workshop-section" aria-labelledby="workshop-title">
          <div className="workshop-heading">
            <p className="eyebrow">В мастерской</p>
            <h2 id="workshop-title">Медленная работа.<br />Долгая жизнь вещи.</h2>
          </div>
          <div className="workshop-photo">
            <img src="/images/workshop.webp" alt="Деревянные табуреты и заготовки в столярной мастерской" loading="lazy" />
          </div>
          <div className="workshop-process">
            <div className="process-row"><span>01</span><div><h3>Выбираем массив</h3><p>Смотрим на плотность, текстуру и естественные особенности каждой заготовки.</p></div></div>
            <div className="process-row"><span>02</span><div><h3>Обрабатываем вручную</h3><p>Строгаем, шлифуем и доводим форму до приятного, живого прикосновения.</p></div></div>
            <div className="process-row"><span>03</span><div><h3>Защищаем маслом</h3><p>Финиш подчёркивает рисунок дерева и позволяет обновлять изделие дома.</p></div></div>
          </div>
        </section>

        <section className="closing-section" aria-label="Собрать заказ">
          <OrnamentStar className="closing-star" outline />
          <p>Для кухни, для дома, на память</p>
          <h2>Выберите вещь,<br />которая останется.</h2>
          <button className="primary-link primary-link-light" onClick={() => setCartOpen(true)}>Собрать заказ <ShoppingBag size={19} /></button>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top" aria-label="Дом 18 — наверх">
          <OrnamentStar className="brand-mark" />
          <span className="brand-type"><strong>ДОМ 18</strong><small>удмуртская мастерская</small></span>
        </a>
        <nav aria-label="Навигация в подвале">
          <a href="#catalog">Каталог</a>
          <a href="#ornament">Об орнаменте</a>
          <a href="#workshop">О работе</a>
        </nav>
        <p>Предметы из дерева<br />с удмуртским характером</p>
        <small>© 2026 Дом 18</small>
      </footer>

      <Modal open={Boolean(selectedProduct)} onClose={() => setSelectedProduct(null)} label={selectedProduct?.name ?? 'Карточка изделия'} className="product-dialog">
        {selectedProduct && (
          <div className="product-dialog-inner">
            <button className="dialog-close" onClick={() => setSelectedProduct(null)} aria-label="Закрыть карточку" autoFocus><X size={22} /></button>
            <div className="dialog-product-image"><img src={selectedProduct.image} alt={selectedProduct.name} style={{ objectPosition: selectedProduct.imagePosition }} /></div>
            <div className="dialog-product-copy">
              <p className="eyebrow">{selectedProduct.category} · ручная работа</p>
              <h2>{selectedProduct.name}</h2>
              <p className="dialog-price">{formatPrice(selectedProduct.price)}</p>
              <p className="dialog-description">{selectedProduct.description}</p>
              <dl className="product-specs">
                <div><dt>Материал</dt><dd>{selectedProduct.material}</dd></div>
                <div><dt>Размер</dt><dd>{selectedProduct.size}</dd></div>
                <div><dt>Покрытие</dt><dd>{selectedProduct.finish}</dd></div>
              </dl>
              <button className="primary-link dialog-add" onClick={() => addToCart(selectedProduct)}>Добавить в корзину <Plus size={20} /></button>
              <p className="unique-note">Рисунок и оттенок дерева могут немного отличаться от фотографии.</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={cartOpen} onClose={() => setCartOpen(false)} label="Корзина" className="cart-dialog">
        <div className="cart-header">
          <div><p className="eyebrow">Ваш выбор</p><h2>Корзина <span>{cartCount}</span></h2></div>
          <button className="dialog-close cart-close" onClick={() => setCartOpen(false)} aria-label="Закрыть корзину" autoFocus><X size={22} /></button>
        </div>
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <OrnamentStar className="empty-star" outline />
            <h3>Здесь пока тихо</h3>
            <p>Добавьте изделия из каталога — они сохранятся в этом браузере.</p>
            <button className="primary-link" onClick={() => { setCartOpen(false); showCategory('Все') }}>Перейти в каталог <ArrowRight size={19} /></button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(({ product, quantity }) => (
                <article className="cart-item" key={product.id}>
                  <img src={product.image} alt="" style={{ objectPosition: product.imagePosition }} />
                  <div className="cart-item-copy">
                    <h3>{product.name}</h3>
                    <p>{formatPrice(product.price)}</p>
                    <div className="quantity-control" aria-label={`Количество: ${product.name}`}>
                      <button onClick={() => changeQuantity(product.id, -1)} aria-label={`Уменьшить количество: ${product.name}`}><Minus size={16} /></button>
                      <span aria-live="polite">{quantity}</span>
                      <button onClick={() => changeQuantity(product.id, 1)} aria-label={`Увеличить количество: ${product.name}`}><Plus size={16} /></button>
                    </div>
                  </div>
                  <button className="remove-item" onClick={() => changeQuantity(product.id, -quantity)} aria-label={`Удалить из корзины: ${product.name}`}><Trash2 size={17} /></button>
                </article>
              ))}
            </div>
            <div className="cart-summary">
              <div className="cart-total"><span>Итого</span><strong>{formatPrice(cartTotal)}</strong></div>
              <button className="primary-link download-order" onClick={downloadOrder}>Скачать список заказа <Download size={19} /></button>
              <p>Список сохранится файлом — его можно отправить мастеру. Корзина хранится только в этом браузере.</p>
            </div>
          </>
        )}
      </Modal>

      <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} onToast={setToast} />

      <div className={toast ? 'toast visible' : 'toast'} role="status" aria-live="polite">
        <Check size={18} /> <span>{toast}</span>
      </div>
    </div>
  )
}
