package main

import (
"crypto/aes"
"crypto/cipher"
"crypto/rand"
"database/sql"
"encoding/base64"
"fmt"
"io"
"log"
"os"
"time"

"github.com/gofiber/fiber/v2"
"github.com/gofiber/fiber/v2/middleware/cors"
"github.com/gofiber/fiber/v2/middleware/logger"
"github.com/google/uuid"
_ "github.com/lib/pq"
)

type Licencia struct {
ID            int       `json:"id"`
Clave         string    `json:"clave"`
Producto      string    `json:"producto"`
Desarrollador string    `json:"desarrollador"`
Categoria     string    `json:"categoria"`
TipoLicencia  string    `json:"tipo_licencia"`
Precio        float64   `json:"precio"`
Descripcion   string    `json:"descripcion"`
Activaciones  int       `json:"activaciones"`
Estado        string    `json:"estado"`
FechaCreacion time.Time `json:"fecha_creacion"`
	PrecioMXN float64 `json:"precio_mxn"`
	Moneda    string  `json:"moneda"`
}

type CarritoItem struct {
ID            int     `json:"id"`
CarritoID     int     `json:"carrito_id"`
LicenciaID    int     `json:"licencia_id"`
Producto      string  `json:"producto"`
Desarrollador string  `json:"desarrollador"`
Categoria     string  `json:"categoria"`
Precio        float64 `json:"precio"`
Cantidad      int     `json:"cantidad"`
}

type Pedido struct {
ID         int       `json:"id"`
PedidoNum  string    `json:"pedido_num"`
SesionID   string    `json:"sesion_id"`
Total      float64   `json:"total"`
Estado     string    `json:"estado"`
FechaPedido time.Time `json:"fecha_pedido"`
Items      []PedidoItem `json:"items"`
}

type PedidoItem struct {
ID             int     `json:"id"`
LicenciaID     int     `json:"licencia_id"`
Producto       string  `json:"producto"`
Desarrollador  string  `json:"desarrollador"`
Precio         float64 `json:"precio"`
ClaveGenerada  string  `json:"clave_generada"`
ClaveCifrada   string  `json:"clave_cifrada"`
}

var db *sql.DB

func main() {
dbUser := os.Getenv("DB_USER")
dbPass := os.Getenv("DB_PASSWORD")
dbName := os.Getenv("DB_NAME")
dbHost := os.Getenv("DB_HOST")
dbPort := os.Getenv("DB_PORT")

if dbHost == "" { dbHost = "postgres-service" }
if dbPort == "" { dbPort = "5432" }

connStr := fmt.Sprintf(
"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
dbHost, dbPort, dbUser, dbPass, dbName,
)

var err error
for i := 0; i < 10; i++ {
db, err = sql.Open("postgres", connStr)
if err == nil {
if pingErr := db.Ping(); pingErr == nil {
log.Println("Conectado a PostgreSQL correctamente")
break
}
}
log.Printf("Intento %d: esperando PostgreSQL...", i+1)
time.Sleep(3 * time.Second)
}
if err != nil {
log.Fatal("No se pudo conectar a PostgreSQL:", err)
}
defer db.Close()

app := fiber.New(fiber.Config{AppName: "LFSRSoft License API v2.0"})

app.Use(cors.New(cors.Config{
AllowOrigins: "*",
AllowMethods: "GET,POST,DELETE",
AllowHeaders: "Content-Type",
}))

app.Use(logger.New(logger.Config{
Format: "[${time}] ${method} ${path} - ${status} - IP:${ip}\n",
}))

// Health
app.Get("/health", func(c *fiber.Ctx) error {
return c.JSON(fiber.Map{"status": "ok", "service": "lfsr-backend"})
})

// Catalogo
app.Get("/licencias", getLicencias)
app.Get("/licencias/categoria/:cat", getLicenciasByCategoria)
app.Get("/licencias/:id", getLicenciaByID)
app.Post("/licencias/generar", generarLicencia)

// Carrito
app.Post("/carrito/agregar", agregarAlCarrito)
app.Get("/carrito/:sesion", obtenerCarrito)
app.Delete("/carrito/:sesion/item/:id", eliminarDelCarrito)
app.Delete("/carrito/:sesion", vaciarCarrito)

// Pedidos
app.Post("/pedidos/checkout", realizarCheckout)
app.Get("/pedidos/:sesion", obtenerPedidos)

log.Println("LFSRSoft backend v2.0 arrancando en :8080")
log.Fatal(app.Listen(":8080"))
}

func getLicencias(c *fiber.Ctx) error {
rows, err := db.Query(`
SELECT id, clave, producto, desarrollador, categoria,
       tipo_licencia, precio, descripcion, activaciones,
       estado, fecha_creacion,
       COALESCE(precio_mxn, ROUND(precio * 17.50, 2)),
       COALESCE(moneda, 'MXN')
FROM licencias WHERE estado = 'disponible'
ORDER BY categoria, id
`)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": err.Error()})
}
defer rows.Close()
var licencias []Licencia
for rows.Next() {
var l Licencia
rows.Scan(&l.ID, &l.Clave, &l.Producto, &l.Desarrollador,
&l.Categoria, &l.TipoLicencia, &l.Precio,
&l.Descripcion, &l.Activaciones, &l.Estado, &l.FechaCreacion,
&l.PrecioMXN, &l.Moneda)
licencias = append(licencias, l)
}
return c.JSON(licencias)
}

func getLicenciasByCategoria(c *fiber.Ctx) error {
categoria := c.Params("cat")
rows, err := db.Query(`
SELECT id, clave, producto, desarrollador, categoria,
       tipo_licencia, precio, descripcion, activaciones,
       estado, fecha_creacion,
       COALESCE(precio_mxn, ROUND(precio * 17.50, 2)),
       COALESCE(moneda, 'MXN')
FROM licencias WHERE categoria = $1 AND estado = 'disponible'
ORDER BY id
`, categoria)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": err.Error()})
}
defer rows.Close()
var licencias []Licencia
for rows.Next() {
var l Licencia
rows.Scan(&l.ID, &l.Clave, &l.Producto, &l.Desarrollador,
&l.Categoria, &l.TipoLicencia, &l.Precio,
&l.Descripcion, &l.Activaciones, &l.Estado, &l.FechaCreacion,
&l.PrecioMXN, &l.Moneda)
licencias = append(licencias, l)
}
return c.JSON(licencias)
}

func getLicenciaByID(c *fiber.Ctx) error {
id := c.Params("id")
var l Licencia
err := db.QueryRow(`
SELECT id, clave, producto, desarrollador, categoria,
       tipo_licencia, precio, descripcion, activaciones,
       estado, fecha_creacion,
       COALESCE(precio_mxn, ROUND(precio * 17.50, 2)),
       COALESCE(moneda, 'MXN')
FROM licencias WHERE id = $1
`, id).Scan(&l.ID, &l.Clave, &l.Producto, &l.Desarrollador,
&l.Categoria, &l.TipoLicencia, &l.Precio,
&l.Descripcion, &l.Activaciones, &l.Estado, &l.FechaCreacion,
&l.PrecioMXN, &l.Moneda)
if err != nil {
return c.Status(404).JSON(fiber.Map{"error": "licencia no encontrada"})
}
return c.JSON(l)
}

func generarLicencia(c *fiber.Ctx) error {
body := struct {
ProductoID int `json:"producto_id"`
}{}
if err := c.BodyParser(&body); err != nil {
return c.Status(400).JSON(fiber.Map{"error": "body invalido"})
}

var producto, desarrollador, categoria string
var precio float64
err := db.QueryRow(`
SELECT producto, desarrollador, categoria, precio
FROM licencias WHERE id = $1
`, body.ProductoID).Scan(&producto, &desarrollador, &categoria, &precio)
if err != nil {
return c.Status(404).JSON(fiber.Map{"error": "producto no encontrado"})
}

licenciaUUID := uuid.New().String()
aesKeyB64 := os.Getenv("AES_KEY")
aesKey, err := base64.StdEncoding.DecodeString(aesKeyB64)
if err != nil || len(aesKey) < 32 {
return c.Status(500).JSON(fiber.Map{"error": "clave AES invalida"})
}
aesKey = aesKey[:32]

block, _ := aes.NewCipher(aesKey)
gcm, _ := cipher.NewGCM(block)
nonce := make([]byte, gcm.NonceSize())
io.ReadFull(rand.Reader, nonce)
cifrado := gcm.Seal(nonce, nonce, []byte(licenciaUUID), nil)
claveCifrada := base64.StdEncoding.EncodeToString(cifrado)

partes := licenciaUUID[:8] + licenciaUUID[9:13] + licenciaUUID[14:18] + licenciaUUID[19:23]
claveVisible := fmt.Sprintf("LFSR-%s-%s-%s-%s",
partes[0:4], partes[4:8], partes[8:12], partes[12:16])

_, err = db.Exec(`
INSERT INTO licencias
  (clave, producto, desarrollador, categoria, tipo_licencia,
   precio, descripcion, activaciones, estado)
SELECT $1, producto, desarrollador, categoria, tipo_licencia,
       precio, descripcion, 0, 'activa'
FROM licencias WHERE id = $2
`, claveVisible, body.ProductoID)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": "error guardando licencia"})
}

log.Printf("[AUDITORIA] Licencia generada: producto=%s clave=%s ip=%s",
producto, claveVisible, c.IP())

return c.Status(201).JSON(fiber.Map{
"clave":         claveVisible,
"clave_cifrada": claveCifrada,
"producto":      producto,
"desarrollador": desarrollador,
"categoria":     categoria,
"precio":        precio,
"mensaje":       "Licencia generada exitosamente",
"timestamp":     time.Now().Format(time.RFC3339),
})
}

func agregarAlCarrito(c *fiber.Ctx) error {
body := struct {
SesionID   string `json:"sesion_id"`
LicenciaID int    `json:"licencia_id"`
}{}
if err := c.BodyParser(&body); err != nil {
return c.Status(400).JSON(fiber.Map{"error": "body invalido"})
}

// Crear carrito si no existe
_, err := db.Exec(`
INSERT INTO carritos (sesion_id) VALUES ($1)
ON CONFLICT (sesion_id) DO UPDATE SET fecha_actualizacion = NOW()
`, body.SesionID)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": "error creando carrito"})
}

var carritoID int
db.QueryRow(`SELECT id FROM carritos WHERE sesion_id = $1`, body.SesionID).Scan(&carritoID)

var l Licencia
err = db.QueryRow(`
SELECT id, producto, desarrollador, categoria, precio
FROM licencias WHERE id = $1
`, body.LicenciaID).Scan(&l.ID, &l.Producto, &l.Desarrollador, &l.Categoria, &l.Precio)
if err != nil {
return c.Status(404).JSON(fiber.Map{"error": "producto no encontrado"})
}

// Verificar si ya está en el carrito
var existeID int
err = db.QueryRow(`
SELECT id FROM carrito_items
WHERE carrito_id = $1 AND licencia_id = $2
`, carritoID, body.LicenciaID).Scan(&existeID)

if err == nil {
return c.JSON(fiber.Map{"mensaje": "El producto ya está en el carrito"})
}

_, err = db.Exec(`
INSERT INTO carrito_items
  (carrito_id, licencia_id, producto, desarrollador, categoria, precio, cantidad)
VALUES ($1, $2, $3, $4, $5, $6, 1)
`, carritoID, l.ID, l.Producto, l.Desarrollador, l.Categoria, l.Precio)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": "error agregando al carrito"})
}

log.Printf("[CARRITO] Agregado: producto=%s sesion=%s", l.Producto, body.SesionID)
return c.Status(201).JSON(fiber.Map{"mensaje": "Producto agregado al carrito"})
}

func obtenerCarrito(c *fiber.Ctx) error {
sesionID := c.Params("sesion")

var carritoID int
err := db.QueryRow(`SELECT id FROM carritos WHERE sesion_id = $1`, sesionID).Scan(&carritoID)
if err != nil {
return c.JSON(fiber.Map{"items": []interface{}{}, "total": 0})
}

rows, err := db.Query(`
SELECT id, carrito_id, licencia_id, producto, desarrollador,
       categoria, precio, cantidad
FROM carrito_items WHERE carrito_id = $1
ORDER BY fecha_agregado
`, carritoID)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": err.Error()})
}
defer rows.Close()

var items []CarritoItem
var total float64
for rows.Next() {
var item CarritoItem
rows.Scan(&item.ID, &item.CarritoID, &item.LicenciaID, &item.Producto,
&item.Desarrollador, &item.Categoria, &item.Precio, &item.Cantidad)
total += item.Precio * float64(item.Cantidad)
items = append(items, item)
}

if items == nil {
items = []CarritoItem{}
}

return c.JSON(fiber.Map{"items": items, "total": total})
}

func eliminarDelCarrito(c *fiber.Ctx) error {
sesionID := c.Params("sesion")
itemID := c.Params("id")

var carritoID int
err := db.QueryRow(`SELECT id FROM carritos WHERE sesion_id = $1`, sesionID).Scan(&carritoID)
if err != nil {
return c.Status(404).JSON(fiber.Map{"error": "carrito no encontrado"})
}

_, err = db.Exec(`DELETE FROM carrito_items WHERE id = $1 AND carrito_id = $2`, itemID, carritoID)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": "error eliminando item"})
}
return c.JSON(fiber.Map{"mensaje": "Item eliminado del carrito"})
}

func vaciarCarrito(c *fiber.Ctx) error {
sesionID := c.Params("sesion")
var carritoID int
err := db.QueryRow(`SELECT id FROM carritos WHERE sesion_id = $1`, sesionID).Scan(&carritoID)
if err != nil {
return c.JSON(fiber.Map{"mensaje": "carrito ya vacio"})
}
db.Exec(`DELETE FROM carrito_items WHERE carrito_id = $1`, carritoID)
return c.JSON(fiber.Map{"mensaje": "Carrito vaciado"})
}

func realizarCheckout(c *fiber.Ctx) error {
body := struct {
SesionID string `json:"sesion_id"`
}{}
if err := c.BodyParser(&body); err != nil {
return c.Status(400).JSON(fiber.Map{"error": "body invalido"})
}

var carritoID int
err := db.QueryRow(`SELECT id FROM carritos WHERE sesion_id = $1`, body.SesionID).Scan(&carritoID)
if err != nil {
return c.Status(404).JSON(fiber.Map{"error": "carrito no encontrado o vacio"})
}

rows, err := db.Query(`
SELECT id, licencia_id, producto, desarrollador, precio
FROM carrito_items WHERE carrito_id = $1
`, carritoID)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": err.Error()})
}
defer rows.Close()

var items []CarritoItem
var total float64
for rows.Next() {
var item CarritoItem
rows.Scan(&item.ID, &item.LicenciaID, &item.Producto, &item.Desarrollador, &item.Precio)
total += item.Precio
items = append(items, item)
}

if len(items) == 0 {
return c.Status(400).JSON(fiber.Map{"error": "el carrito esta vacio"})
}

pedidoNum := fmt.Sprintf("LFSR-%s", uuid.New().String()[:8])
var pedidoID int
err = db.QueryRow(`
INSERT INTO pedidos (pedido_num, sesion_id, total, estado)
VALUES ($1, $2, $3, 'completado') RETURNING id
`, pedidoNum, body.SesionID, total).Scan(&pedidoID)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": "error creando pedido"})
}

aesKeyB64 := os.Getenv("AES_KEY")
aesKey, _ := base64.StdEncoding.DecodeString(aesKeyB64)
if len(aesKey) > 32 { aesKey = aesKey[:32] }

var pedidoItems []PedidoItem
for _, item := range items {
licenciaUUID := uuid.New().String()

block, _ := aes.NewCipher(aesKey)
gcm, _ := cipher.NewGCM(block)
nonce := make([]byte, gcm.NonceSize())
io.ReadFull(rand.Reader, nonce)
cifrado := gcm.Seal(nonce, nonce, []byte(licenciaUUID), nil)
claveCifrada := base64.StdEncoding.EncodeToString(cifrado)

partes := licenciaUUID[:8] + licenciaUUID[9:13] + licenciaUUID[14:18] + licenciaUUID[19:23]
claveVisible := fmt.Sprintf("LFSR-%s-%s-%s-%s",
partes[0:4], partes[4:8], partes[8:12], partes[12:16])

db.Exec(`
INSERT INTO pedido_items
  (pedido_id, licencia_id, producto, desarrollador, precio, clave_generada, clave_cifrada)
VALUES ($1, $2, $3, $4, $5, $6, $7)
`, pedidoID, item.LicenciaID, item.Producto, item.Desarrollador,
item.Precio, claveVisible, claveCifrada)

db.Exec(`UPDATE licencias SET stock = COALESCE(stock,1) - 1,
estado = CASE WHEN COALESCE(stock,1) - 1 <= 0 THEN 'agotado' ELSE estado END
WHERE id = $1`, item.LicenciaID)
log.Printf("[PEDIDO] %s - producto=%s clave=%s", pedidoNum, item.Producto, claveVisible)

pedidoItems = append(pedidoItems, PedidoItem{
LicenciaID:    item.LicenciaID,
Producto:      item.Producto,
Desarrollador: item.Desarrollador,
Precio:        item.Precio,
ClaveGenerada: claveVisible,
ClaveCifrada:  claveCifrada,
})
}

db.Exec(`DELETE FROM carrito_items WHERE carrito_id = $1`, carritoID)
db.Exec(`UPDATE carritos SET estado = 'completado' WHERE id = $1`, carritoID)

return c.Status(201).JSON(fiber.Map{
"pedido_num": pedidoNum,
"total":      total,
"items":      pedidoItems,
"mensaje":    "Pedido completado exitosamente",
"timestamp":  time.Now().Format(time.RFC3339),
})
}

func obtenerPedidos(c *fiber.Ctx) error {
sesionID := c.Params("sesion")

rows, err := db.Query(`
SELECT id, pedido_num, sesion_id, total, estado, fecha_pedido
FROM pedidos WHERE sesion_id = $1
ORDER BY fecha_pedido DESC
`, sesionID)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": err.Error()})
}
defer rows.Close()

var pedidos []Pedido
for rows.Next() {
var p Pedido
rows.Scan(&p.ID, &p.PedidoNum, &p.SesionID, &p.Total, &p.Estado, &p.FechaPedido)

itemRows, _ := db.Query(`
SELECT id, licencia_id, producto, desarrollador, precio, clave_generada, clave_cifrada
FROM pedido_items WHERE pedido_id = $1
`, p.ID)
defer itemRows.Close()

for itemRows.Next() {
var pi PedidoItem
itemRows.Scan(&pi.ID, &pi.LicenciaID, &pi.Producto, &pi.Desarrollador,
&pi.Precio, &pi.ClaveGenerada, &pi.ClaveCifrada)
p.Items = append(p.Items, pi)
}

if p.Items == nil { p.Items = []PedidoItem{} }
pedidos = append(pedidos, p)
}

if pedidos == nil { pedidos = []Pedido{} }
return c.JSON(pedidos)
}
