@login
Feature: Login

  Como usuario del sistema,
  Quiero autenticarme con mis credenciales,
  Para acceder al dashboard de la aplicación.

  Background:
    Given el usuario se encuentra en la página de login

  @smoke
  Scenario: Login exitoso con credenciales válidas
    When ingresa el usuario "usuario_valido" y hace clic en Login
    Then ve el mensaje "Inicio de sesion exitoso. Redirigiendo..."
    And es redirigido al dashboard en menos de 1.5 segundos

  @regression
  Scenario: Login con credenciales incorrectas
    When ingresa el usuario "usuario_invalido" y hace clic en Login
    Then ve el mensaje "Usuario o contrasena incorrectos. Verifica tus datos e intenta nuevamente."
    And permanece en la página de login

  @regression
  Scenario: Login con usuario bloqueado
    When ingresa el usuario "usuario_bloqueado" y hace clic en Login
    Then ve el mensaje "Tu cuenta ha sido bloqueada. Contacta al administrador para recuperar el acceso."
    And permanece en la página de login

  @regression
  Scenario: Login con campos vacíos
    When no ingresa ningún dato en los campos y hace clic en Login
    Then ve el mensaje "Por favor completa todos los campos."
    And permanece en la página de login

  @regression
  Scenario: Login con solo usuario completado
    When ingresa el usuario "usuario_solo_user" y hace clic en Login
    Then ve el mensaje "Por favor completa todos los campos."
    And permanece en la página de login

  @regression
  Scenario: Login con solo contraseña completada
    When ingresa el usuario "usuario_solo_password" y hace clic en Login
    Then ve el mensaje "Por favor completa todos los campos."
    And permanece en la página de login
