@login
Feature: Login

  Como usuario registrado,
  Quiero iniciar sesion en la plataforma,
  Para acceder a las funcionalidades del sistema.

  Background:
    Given que el usuario se encuentra en la pagina de login

  @smoke
  Scenario: Login exitoso con credenciales validas
    When ingresa el usuario "admin" y la contrasena "1234"
    And hace clic en el boton "Iniciar sesion"
    Then ve el mensaje "Inicio de sesion exitoso. Redirigiendo..."
    And es redirigido al dashboard en menos de 2 segundos

  @regression
  Scenario: Login fallido con credenciales incorrectas
    When ingresa el usuario "usuario_invalido" y la contrasena "pass_invalido"
    And hace clic en el boton "Iniciar sesion"
    Then ve el mensaje de error "Usuario o contraseña incorrectos. Verifica tus datos e intenta nuevamente."
    And permanece en la pagina de login

  @regression
  Scenario: Login bloqueado para usuario con cuenta suspendida
    When ingresa el usuario "bloqueado" y la contrasena "1234"
    And hace clic en el boton "Iniciar sesion"
    Then ve el mensaje de error "Tu cuenta ha sido bloqueada. Contacta al administrador para recuperar el acceso."
    And permanece en la pagina de login

  @regression
  Scenario: Login rechazado cuando los campos estan vacios
    When hace clic en el boton "Iniciar sesion" sin completar ningun campo
    Then ve el mensaje de error "Por favor completa todos los campos."
    And permanece en la pagina de login
