<?php
// Verificar si el formulario ha sido enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 1. Recoger y limpiar los datos (Sanitización)
    // strip_tags elimina etiquetas HTML para evitar ataques XSS
    $nombre = strip_tags(trim($_POST["nombre"]));
    $nombre = str_replace(array("\r","\n"),array(" "," "),$nombre);
    
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $telefono = trim($_POST["telefono"]);
    $mensaje = trim($_POST["mensaje"]);

    // 2. Validar que los datos estén completos
    if (empty($nombre) || empty($mensaje) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Si hay error, redirigir con error
        header("Location: contacto.html?estado=error_datos");
        exit;
    }

    // 3. Configurar el correo de destino
    // AQUÍ PON TU CORREO REAL
    $destinatario = "lastorga@siinconte.com"; 
    
    $asunto = "Nuevo contacto desde sitio web SIINCO: $nombre";

    // 4. Construir el cuerpo del correo
    $contenido = "Has recibido un nuevo mensaje desde el formulario de contacto.\n\n";
    $contenido .= "Nombre: $nombre\n";
    $contenido .= "Correo Electronico: $email\n";
    $contenido .= "Telefono: $telefono\n\n";
    $contenido .= "Mensaje:\n$mensaje\n";

    // 5. Cabeceras del correo (Headers)
    // Es importante poner un 'From' del propio dominio para no caer en Spam
    // Ejemplo: no-reply@siinconte.com (aunque no exista, ayuda a la entrega)
    $headers = "From: no-reply@siinconte.com\r\n";
    $headers .= "Reply-To: $email\r\n"; // Para que al dar 'Responder' le escribas al cliente
    $headers .= "X-Mailer: PHP/" . phpversion();

    // 6. Enviar el correo
    if (mail($destinatario, $asunto, $contenido, $headers)) {
        // Éxito: Redirigir a contacto con mensaje de éxito
        header("Location: contacto.html?estado=exito");
    } else {
        // Fallo: Redirigir con mensaje de error
        header("Location: contacto.html?estado=error_servidor");
    }

} else {
    // Si intentan acceder al archivo directamente sin enviar formulario
    header("Location: contacto.html");
}
?>