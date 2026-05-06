# 📌 BackEnd-Proyecto

## 👥 Integrantes
- Gonzalo Carrizo  
- Ignacio Koffler  

---

## 🧾 Descripción

**Libertadnt** es un sistema de gestión carcelaria que permite administrar:

- Reclusos y su asignación a celdas/sectores  
- Personal de seguridad  
- Actividades diarias  
- Condenas y sentencias  

El sistema cuenta con una base de datos que centraliza toda la información necesaria para la gestión operativa.

---

## ⚙️ Instalación

1. Crear una carpeta en tu computadora  

2. Inicializar el repositorio y descargar el proyecto:

```bash
git init
git remote add origin https://github.com/utnfrrodsw/desarrollo-de-software.git
git pull origin main
```

Tambien vas a tener que crear un archivo .env en el directorio principal. \
db_user=nombreUsuario <- \
db_passwd=contra <- \
db_host=127.0.0.1 \
db_port=3306 \
db_name=libertadnt \
server_port=3000 \
JWT_SECRET="4265#%mkj68u7" \
SALT_ROUNDS=10 \
production_port=3000 \
GMAIL_USER=email <- \
GMAIL_APP_PASSWORD=contraseniaGmailDeApp <- \
FRONTEND_URL=http://localhost:4200 \
Modifica de manera obligatoria los campos marcados. En el caso de GMAIL_APP_PASSWORD, tienes que activar una contraseña especial para el uso automatico del mail, para eso tenes que:
1- Ir a myaccount.google.com \
2- Habilitar verificacion de 2 pasos \
3- Buscar en la barra de busqueda 'App Passwords' y crear una contraseña con la etiqueta 'libertadnt'. \
4- Copia la contraseña creada en GMAIL_APP_PASSWORD y asegurate de usar el mismo mail con el que creaste la contraseña en GMAIL_USER. \

Luego tienes que tener montado un servidor MySQL en el puerto 3306 preferiblemente. Recomendamos establecer el servidor MySQL usando MySQL Workbench.

Para comenzar a usar el servidor backend, ejecute 'pnpm start:dev' en la terminal.

Finalmente, ejecute el script de MySQL en workbench para tener datos de prueba y poder utilizar el sistema con varios datos cargados (puede encontrar el script la carpeta de drive).

Use el usuario {codigo: 1, contraseña: 123r} para usar las capacidades de nivel de acceso especial y {codigo: 2, contraseña: 123r} para el nivel de acceso normal.
