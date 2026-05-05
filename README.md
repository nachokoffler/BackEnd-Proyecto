# BackEnd-Proyecto
Integrantes: Gonzalo Carrizo e Ignacio Koffler.

Descripción:
Libertadnt es un sistema de gestión carcelario, se encarga de la administración tanto del personal de seguridad como de los reclusos, cuenta tanto con una base de datos para poder contabilizar e indicar cada preso y su sector asignado, como sus actividades diarias y el personal de seguridad asignado.

Uso:
crea un carpeta en tu computadora, ejecuta git init y luego git remote add origin https://github.com/utnfrrodsw/desarrollo-de-software.git.
Luego ejecuta pnpm install.

Tambien vas a tener que crear un archivo .env en el directorio principal.
db_user=nombreUsuario <- \
db_passwd=contra <-
db_host=127.0.0.1
db_port=3306
db_name=libertadnt
server_port=3000
JWT_SECRET="4265#%mkj68u7"
SALT_ROUNDS=10
production_port=3000
GMAIL_USER=email <-
GMAIL_APP_PASSWORD=contraseniaGmailDeApp <-
FRONTEND_URL=http://localhost:4200
Modifica de manera obligatoria los campos marcados. en el caso de GMAIL_APP_PASSWORD, tienes que activar una contraseña especial para el uso automatico del mail, para eso tenes que:
1- ir a myaccount.google.com
2- habilitar verificacion de 2 pasos
3- buscar en la barra de busqueda 'App Passwords' y crear una contraseña con la etiqueta 'libertadnt'.
4- copia la contraseña creada en GMAIL_APP_PASSWORD y asegurate de usar el mismo mail con el que creaste la contraseña en GMAIL_USER.

Luego tienes que tener montado un servidor MySQL en el puerto 3306 preferiblemente. recomendamos establecer el servidor MySQL usando MySQL Workbench.

para comenzar a usar el servidor backend, ejecute 'pnpm start:dev' en la terminal.

Finalmente, ejecute el script de MySQL en workbench para tener datos de prueba y poder utilizar el sistema con varios datos cargados.

