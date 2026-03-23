@login
Feature: Login

  Como usuario registrado,
  Quiero poder iniciar sesión con mis credenciales,
  Para acceder al sistema de forma segura.

  Background:
    Given que el usuario se encuentra en la página de login

  @smoke
  Scenario: Login exitoso con credenciales válidas
    When ingresa el usuario "admin_local" y hace clic en Iniciar sesión
    Then ve el mensaje "Inicio de sesion exitoso. Redirigiendo..."
    And es redirigido al dashboard en menos de 2 segundos

  @regression
  Scenario: Error al ingresar credenciales incorrectas
    When ingresa el usuario "usuario_invalido_local" y hace clic en Iniciar sesión
    Then ve el mensaje "Usuario o contraseña incorrectos. Verifica tus datos e intenta nuevamente."
    And permanece en la página de login

  @regression
  Scenario: Error al ingresar con usuario bloqueado
    When ingresa el usuario "bloqueado_local" y hace clic en Iniciar sesión
    Then ve el mensaje "Tu cuenta ha sido bloqueada. Contacta al administrador para recuperar el acceso."
    And permanece en la página de login

  @regression
  Scenario: Error al intentar iniciar sesión con campos vacíos
    When hace clic en Iniciar sesión sin completar ningún campo
    Then ve el mensaje "Por favor completa todos los campos."
    And permanece en la página de login
