# Billet-BunPlay

Billet-BunPlay es una billetera digital de uso cotidiano orientada a personas que manejan múltiples monedas en su día a día, ya sea por trabajo, ahorro o viajes. Su propósito es centralizar la gestión del dinero en un único entorno seguro, simple y visual, eliminando la necesidad de usar varias aplicaciones para comprar divisas, transferir fondos o llevar el control de gastos.

El producto está pensado para adultos, jóvenes y profesionales que necesitan una herramienta práctica para administrar su patrimonio sin complicaciones, con soporte para operaciones multi-moneda, trazabilidad de movimientos y una experiencia móvil-first.

---

## 1. Visión general

 Billet-BunPlay permite a los usuarios:

- gestionar balances en varias monedas simultáneamente;
- comprar y vender divisas utilizando tasas de cambio en tiempo real;
- realizar swaps o intercambios entre monedas dentro de la misma billetera;
- separar gastos compartidos con otros usuarios;
- crear metas de ahorro y hacer seguimiento del progreso;
- visualizar el historial de transacciones y métricas financieras mediante un dashboard.

La propuesta central es ofrecer una billetera digital unificada, confiable y fácil de usar que permita tomar decisiones financieras con mayor claridad.

---

## 2. Problema que resuelve

Hoy, muchas personas enfrentan un proceso financiero fragmentado:

- usan distintas aplicaciones para comprar divisas;
- necesitan otras herramientas para transferencias;
- no cuentan con una vista centralizada de su patrimonio total;
- tienen dificultades para dividir gastos compartidos;
- no disponen de un historial claro y auditable de cada operación.

 Billet-BunPlay soluciona esta fragmentación al reunir funciones de gestión, conversión y seguimiento financiero en un solo lugar.

---

## 3. Propuesta de valor

Billet-BunPlay ofrece:

- una experiencia integral para el manejo de dinero en múltiples monedas;
- operaciones transparentes con tasas de cambio actualizadas;
- confirmaciones automáticas y trazabilidad completa;
- herramientas de organización para gastos compartidos y metas de ahorro;
- una interfaz pensada para móviles, rápida y accesible.

---

## 4. Público objetivo

Billet-BunPlay está dirigida a:

- personas que viajan o trabajan con divisas;
- freelance, emprendedores y profesionales que reciben o pagan en diferentes monedas;
- usuarios que quieren ahorrar en varias divisas sin depender de múltiples plataformas;
- personas que necesitan una solución simple para administrar dinero personal y compartido.

---

## 5. Funcionalidades principales

### 5.1 Gestión multi-moneda

- soporte para al menos 3 monedas simultáneas: COP, USD y EUR.
- posibilidad de ampliar el catálogo de monedas en el futuro.
- balances individuales por moneda dentro de una wallet.

### 5.2 Compra y venta de monedas

- compra de divisas con tasa de cambio vigente;
- venta de divisas desde la billetera;
- cálculo automático del monto equivalente en la moneda destino.

### 5.3 Intercambio interno (swap)

- conversión directa entre dos monedas dentro de la misma wallet;
- registro de la tasa aplicada en el momento exacto de la transacción.

### 5.4 Historial de transacciones

- línea de tiempo de operaciones;
- estados de transacción: pendiente, completada o fallida;
- trazabilidad completa para auditoría.

### 5.5 Confirmaciones por correo

- envío automático de correos de confirmación vía AWS SES tras cada transacción relevante.

### 5.6 Gastos compartidos

- creación de gastos compartidos;
- división entre usuarios registrados;
- liquidación directa de deudas desde la wallet.

### 5.7 Metas de ahorro

- creación de metas con monto, moneda y fecha objetivo;
- reserva automática o manual de fondos;
- seguimiento del progreso con indicadores visuales.

### 5.8 Dashboard y reportes

- evolución del balance por moneda;
- distribución de gastos;
- historial con gráficos y tendencias;
- visualización de actividad reciente.

### 5.9 Favoritos

- guardar operaciones o contactos frecuentes como favoritos;
- acceso rápido a transacciones reutilizables.

---

## 6. Experiencia de usuario

### Diseño mobile first

La interfaz debe estar optimizada para pantallas pequeñas y priorizar:

- navegación simple y clara;
- botones grandes y accesibles;
- flujos cortos para transferencias, conversiones y gastos compartidos;
- feedback visual inmediato en cada acción.

### CRUD y manejo de datos

La plataforma deberá contemplar operaciones CRUD para:

- usuarios;
- wallets;
- balances;
- transacciones;
- gastos compartidos;
- metas de ahorro;
- favoritos.

---

## 7. Modelo de datos

### 7.1 Entidades principales

#### users

- id: UUID
- name
- email
- password_hash
- created_at
- updated_at

#### wallets

- id: UUID
- user_id: UUID (FK)
- created_at

Cada usuario tendrá exactamente una wallet.

#### balances

- id: UUID
- wallet_id: UUID (FK)
- currency_code: VARCHAR(3)
- amount: NUMERIC(18, 6)
- updated_at

Este modelo permite manejar una wallet con múltiples balances, lo cual facilita la escalabilidad y la incorporación de nuevas monedas.

#### transactions

- id: UUID
- wallet_id: UUID (FK)
- type: ENUM('buy', 'sell', 'exchange', 'transfer', 'shared_expense')
- currency_from: VARCHAR(3)
- currency_to: VARCHAR(3)
- amount_from: NUMERIC(18, 6)
- amount_to: NUMERIC(18, 6)
- exchange_rate: NUMERIC(18, 6)
- status: ENUM('pending', 'completed', 'failed')
- description: TEXT (opcional)
- created_at: TIMESTAMP UTC

#### shared_expenses

- id: UUID
- creator_wallet_id: UUID
- title
- total_amount
- currency_code
- status
- created_at

#### shared_expense_participants

- id: UUID
- shared_expense_id: UUID
- user_id: UUID
- share_amount
- status
- created_at

#### savings_goals

- id: UUID
- wallet_id: UUID
- title
- target_amount
- currency_code
- target_date
- current_amount
- status
- created_at

#### favorites

- id: UUID
- user_id: UUID
- name
- type
- payload
- created_at

### 7.2 Consideraciones de negocio

- las transacciones nunca deben eliminarse ni modificarse;
- los balances reflejan el estado real del dinero;
- el ledger de transacciones funciona como historial y auditoría;
- los cambios en los balances se derivan de las operaciones registradas.

---

## 8. Sistema de transacciones

Cada transacción debe registrar:

- el tipo de operación;
- las monedas involucradas;
- el monto debitado y acreditado;
- la tasa de cambio aplicada en el momento exacto;
- el estado del proceso;
- una descripción opcional.

Este enfoque permite tener un historial claro y consistente para soporte, auditoría y análisis financiero.

---

## 9. Integración con API de tasas de cambio

### API seleccionada: Frankfurter

Se utilizará Frankfurter para obtener tasas de cambio en tiempo real.

Razones:

- gratuita;
- no requiere API key;
- no tiene límite de requests reportado;
- es mantenida por el Banco Central Europeo;
- ofrece endpoints REST simples y bien documentados.

### Estrategia de caching

Para optimizar rendimiento y resiliencia:

1. las tasas se actualizarán cada 1 hora y se almacenarán en memoria del servidor mediante un singleton;
2. cada entrada del caché guardará el timestamp de su última actualización;
3. si la API falla, se servirá el último valor cacheado y se registrará un warning en logs;
4. si no hay caché disponible y la API falla, se devolverá un error controlado al frontend con mensaje descriptivo.

---

## 10. Arquitectura propuesta

### Capas sugeridas

- Frontend: aplicación web/mobile-first con interfaz moderna y fluida;
- Backend: API REST para autenticación, wallet, balances, transacciones y reportes;
- Base de datos: PostgreSQL o MySQL para transacciones y consistencia;
- Servicios externos: AWS SES para correos, Frankfurter para tasas de cambio;
- Infraestructura: despliegue en contenedores o servicios cloud escalables.

### Flujo general

1. el usuario inicia sesión;
2. el sistema carga la wallet y sus balances;
3. el usuario realiza una compra, venta, swap o gasto compartido;
4. se valida la operación;
5. se actualizan los balances;
6. se registra la transacción en el ledger;
7. se envía confirmación por email si aplica.

---

## 11. Stack tecnológico recomendado

### Backend

- Node.js + TypeScript
- NestJS o Express
- Prisma ORM
- PostgreSQL

### Frontend

- React o Next.js
- Tailwind CSS
- React Query / TanStack Query
- Zustand o Redux Toolkit

### Infraestructura

- Docker
- AWS SES
- Vercel / Render / Railway / AWS ECS

---

## 12. Requisitos funcionales

- autenticación de usuarios;
- creación y gestión de una wallet por usuario;
- manejo de balances por moneda;
- compra, venta e intercambio de monedas;
- historial de transacciones con estados;
- gastos compartidos con división entre participantes;
- metas de ahorro con seguimiento;
- dashboard con gráficos y resumen financiero;
- favoritos para operaciones frecuentes;
- notificaciones por correo de confirmación.

---

## 13. Requisitos no funcionales

- seguridad en manejo de datos financieros;
- trazabilidad de movimientos;
- rendimiento adecuado para uso móvil;
- buen manejo de errores en integraciones externas;
- consistencia en la actualización de balances;
- diseño accesible y responsive.

---

## 14. Roadmap sugerido

### MVP

- registro e inicio de sesión;
- creación de wallet y balances iniciales;
- soporte para COP, USD y EUR;
- compra, venta y swap;
- historial de transacciones;
- confirmaciones por correo.

### Segunda fase

- gastos compartidos;
- metas de ahorro;
- favoritos;
- dashboard con gráficos.

### Fase futura

- integración con pagos reales;
- soporte para más monedas;
- notificaciones push;
- analíticas avanzadas y recomendaciones financieras.

---

## 15. Resumen ejecutivo

Billet-BunPlay es una propuesta sólida para transformar la forma en que las personas administran su dinero en múltiples monedas. Su enfoque combina simplicidad, seguridad, trazabilidad y versatilidad para ofrecer una experiencia financiera moderna, especialmente útil para quienes necesitan mover, ahorrar y organizar fondos de forma rápida y ordenada.

---

## 16. Nota de desarrollo

Este README sirve como base de producto y arquitectura para el desarrollo inicial de la aplicación. Puede adaptarse a medida que se definan los requisitos técnicos, la identidad visual y la estrategia de despliegue.
