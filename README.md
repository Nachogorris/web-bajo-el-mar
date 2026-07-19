# Web completa · Escuela Infantil Bajo el Mar

Esta carpeta contiene una web estática completa lista para subir a Hostinger.

## Archivos principales

- `index.html` · Página de inicio con hero dinámico: la puerta se abre al hacer scroll.
- `nosotros.html` · Historia, equipo y valores.
- `metodologia.html` · Proyecto educativo, programas por edades y actividades.
- `admisiones.html` · Proceso de admisión, ayudas y formulario.
- `instalaciones.html` · Página completa de instalaciones.
- `familias.html` · Comunicación con familias y futuro portal de padres.
- `blog.html` · Blog y recursos para SEO.
- `contacto.html` · Datos de contacto, formulario y mapa.
- `aviso-legal.html` y `privacidad.html` · Plantillas legales orientativas.
- `css/styles.css` · Estilos globales.
- `js/main.js` · Menú móvil, animaciones y apertura de la puerta.
- `assets/hero-puerta-bajo-el-mar.jpg` · Imagen del hero.

## Cómo subirlo a Hostinger

1. Entra en Hostinger > Administrador de archivos.
2. Abre la carpeta `public_html`.
3. Sube todo el contenido de esta carpeta, no la carpeta entera.
4. Asegúrate de que `index.html` queda directamente dentro de `public_html`.
5. Cambia en `sitemap.xml` la URL `https://tudominio.com` por el dominio real.
6. Revisa `aviso-legal.html` y `privacidad.html` con los datos legales reales del centro.

## Notas

- El formulario usa `mailto:` porque la web es 100% estática. Para recibir formularios sin abrir el correo del usuario, habría que conectar un backend PHP o una herramienta externa.
- Las páginas están comentadas en el código HTML para que sea fácil editarlas.
- La página `instalaciones.html` está incluida y desarrollada.
