@login
Feature: Login

  Como usuario registrado,
  Quiero iniciar sesión con mis credenciales,
  Para acceder al sistema de forma segura.

  Background:
    Given que el usuario está en la página de inicio de sesión

  @smoke
  Scenario: Login exitoso con credenciales válidas
    When ingresa el usuario "admin" y la contraseña "1234"
    And hace clic en el botón "Iniciar sesion"
    Then ve el mensaje "Inicio de sesion exitoso. Redirigiendo..."
    And es redirigido al dashboard en menos de 2 segundos

  @regression
  Scenario: Mensaje de error al ingresar credenciales incorrectas
    When ingresa el usuario "usuario_invalido" y la contraseña "clave_invalida"
    And hace clic en el botón "Iniciar sesion"
    Then ve el mensaje "Usuario o contraseña incorrectos. Verifica tus datos e intenta nuevamente."
    And permanece en la página de inicio de sesión

  @regression
  Scenario: Mensaje de cuenta bloqueada al intentar acceder con usuario bloqueado
    When ingresa el usuario "bloqueado" y la contraseña "1234"
    And hace clic en el botón "Iniciar sesion"
    Then ve el mensaje "Tu cuenta ha sido bloqueada. Contacta al administrador para recuperar el acceso."
    And permanece en la página de inicio de sesión

  @regression
  Scenario: Mensaje de validación al intentar iniciar sesión con campos vacíos
    When hace clic en el botón "Iniciar sesion" sin completar ningún campo
    Then ve el mensaje "Por favor completa todos los campos."
    And permanece en la página de inicio de sesión
