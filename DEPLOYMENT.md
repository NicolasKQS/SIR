# Guía de Despliegue a Producción
## Sistema de Modelado Epidemiológico SEDES Bolivia

###  Pre-requisitos

- Node.js 16.x o superior
- npm 8.x o superior
- 2GB RAM mínimo
- Navegador moderno (Chrome, Firefox, Edge, Safari)

###  Instalación

```bash
# 1. Clonar/copiar el proyecto
cd SIR

# 2. Instalar dependencias
npm install

# 3. Verificar que no hay errores
npm test
```

### 🏗️ Compilación para Producción

```bash
# Compilar con optimizaciones
npm run build

# El resultado estará en la carpeta /build
```

###  Contenido del Build

La carpeta `build/` contendrá:
- `index.html` - Archivo principal
- `static/` - JavaScript, CSS e imágenes optimizados
- Archivos comprimidos y minificados
- Source maps deshabilitados (seguridad)

###  Opciones de Despliegue

#### Opción 1: Servidor Web Estático (Recomendado)

**Apache:**
```apache
<VirtualHost *:80>
    ServerName sedes-epidemiologia.bo
    DocumentRoot /var/www/sedes/build
    
    <Directory /var/www/sedes/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

**Nginx:**
```nginx
server {
    listen 80;
    server_name sedes-epidemiologia.bo;
    root /var/www/sedes/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Opción 2: Servidor Node.js con Express

```bash
# Instalar servidor HTTP simple
npm install -g serve

# Ejecutar en puerto 3000
serve -s build -l 3000
```

#### Opción 3: Servicios en la Nube

**Netlify:**
```bash
# Instalar CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

### Configuración de Seguridad

1. **HTTPS**: Obligatorio para producción
   ```bash
   # Certificado Let's Encrypt gratuito
   sudo certbot --apache -d sedes-epidemiologia.bo
   ```

2. **Firewall**: Permitir solo puertos 80/443

3. **Headers de seguridad**: Ya incluidos en configuración Nginx/Apache

###  Monitoreo

**Métricas a vigilar:**
- Tiempo de carga inicial: < 3 segundos
- Memoria del navegador: < 200MB
- Errores JavaScript: 0
- Disponibilidad: 99.9%

**Logs recomendados:**
```bash
# Apache
tail -f /var/log/apache2/access.log

# Nginx  
tail -f /var/log/nginx/access.log
```

###  Actualizaciones

```bash
# 1. Backup del build anterior
cp -r /var/www/sedes/build /var/www/sedes/build.backup

# 2. Nuevo build
npm run build

# 3. Deploy
rm -rf /var/www/sedes/build
cp -r build /var/www/sedes/

# 4. Verificar
curl https://sedes-epidemiologia.bo
```

###  Optimizaciones Aplicadas

 Code splitting automático  
 Compresión de assets  
 Tree shaking (eliminación de código no usado)  
 Minificación de JS/CSS  
 Lazy loading de componentes  
 Source maps deshabilitados  
 Caché de navegador optimizado  

###  Solución de Problemas

**Problema**: Página en blanco
```bash
# Verificar que existe index.html
ls -la build/index.html

# Verificar permisos
chmod -R 755 build/
```

**Problema**: JavaScript no carga
```bash
# Verificar ruta de base en index.html
# Debe ser: <base href="/">
```

**Problema**: Errores CORS
```bash
# Agregar headers CORS en servidor
Access-Control-Allow-Origin: *
```

###  Soporte

**Equipo Técnico SEDES**  
Email: soporte@sedes.bo  
Teléfono: +591 (2) xxx-xxxx

###  Checklist Pre-Despliegue

- [ ] `npm run build` sin errores
- [ ] Todas las páginas cargan correctamente
- [ ] PDF se genera sin errores
- [ ] Datos de los 9 departamentos correctos
- [ ] 15 perfiles de enfermedad funcionan
- [ ] Gráficos se visualizan correctamente
- [ ] Responsive en móvil/tablet/desktop
- [ ] Navegación entre vistas fluida
- [ ] Notificaciones funcionan
- [ ] Branding SEDES visible
- [ ] HTTPS configurado
- [ ] Backup realizado
- [ ] Monitoreo activo

###  Métricas de Éxito

- **Performance**: Lighthouse score > 90
- **Accesibilidad**: Score > 90
- **SEO**: Score > 90
- **Best Practices**: Score > 90

---

**Versión del Sistema**: 1.0.0  
**Fecha**: Diciembre 2025  
**Estado**: Listo para Producción 
