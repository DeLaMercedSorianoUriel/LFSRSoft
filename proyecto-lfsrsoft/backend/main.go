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
}

var db *sql.DB

func main() {
dbUser := os.Getenv("DB_USER")
dbPass := os.Getenv("DB_PASSWORD")
dbName := os.Getenv("DB_NAME")
dbHost := os.Getenv("DB_HOST")
dbPort := os.Getenv("DB_PORT")

if dbHost == "" {
dbHost = "postgres-service"
}
if dbPort == "" {
dbPort = "5432"
}

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

app := fiber.New(fiber.Config{
AppName: "LFSRSoft License API v1.0",
})

app.Use(cors.New(cors.Config{
AllowOrigins: "*",
AllowMethods: "GET,POST",
AllowHeaders: "Content-Type",
}))

app.Use(logger.New(logger.Config{
Format: "[${time}] ${method} ${path} - ${status} - IP:${ip}\n",
}))

app.Get("/health", func(c *fiber.Ctx) error {
return c.JSON(fiber.Map{
"status":  "ok",
"service": "lfsr-backend",
})
})

app.Get("/licencias", getLicencias)
app.Get("/licencias/categoria/:cat", getLicenciasByCategoria)
app.Get("/licencias/:id", getLicenciaByID)
app.Post("/licencias/generar", generarLicencia)

log.Println("LFSRSoft backend arrancando en :8080")
log.Fatal(app.Listen(":8080"))
}

func getLicencias(c *fiber.Ctx) error {
rows, err := db.Query(`
SELECT id, clave, producto, desarrollador, categoria,
       tipo_licencia, precio, descripcion, activaciones,
       estado, fecha_creacion
FROM licencias
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
&l.Descripcion, &l.Activaciones, &l.Estado, &l.FechaCreacion)
licencias = append(licencias, l)
}
return c.JSON(licencias)
}

func getLicenciasByCategoria(c *fiber.Ctx) error {
categoria := c.Params("cat")
rows, err := db.Query(`
SELECT id, clave, producto, desarrollador, categoria,
       tipo_licencia, precio, descripcion, activaciones,
       estado, fecha_creacion
FROM licencias WHERE categoria = $1
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
&l.Descripcion, &l.Activaciones, &l.Estado, &l.FechaCreacion)
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
       estado, fecha_creacion
FROM licencias WHERE id = $1
`, id).Scan(&l.ID, &l.Clave, &l.Producto, &l.Desarrollador,
&l.Categoria, &l.TipoLicencia, &l.Precio,
&l.Descripcion, &l.Activaciones, &l.Estado, &l.FechaCreacion)
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

block, err := aes.NewCipher(aesKey)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": "error creando cipher"})
}
gcm, err := cipher.NewGCM(block)
if err != nil {
return c.Status(500).JSON(fiber.Map{"error": "error creando GCM"})
}
nonce := make([]byte, gcm.NonceSize())
if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
return c.Status(500).JSON(fiber.Map{"error": "error generando nonce"})
}
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
