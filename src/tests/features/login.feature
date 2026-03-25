@login
Feature: Login

  Como usuario registrado,
  Quiero iniciar sesion con mis credenciales,
  Para acceder al sistema.

  Background:
    Given que el usuario esta en la pagina de login

  @smoke
  Scenario: Login exitoso con credenciales validas
    When ingresa el usuario "usuario_valido" y hace clic en Login
    Then ve el mensaje "Inicio de sesion exitoso. Redirigiendo..."
    And es redirigido automaticamente en 1.2 segundos

  @regression
  Scenario: Mensaje de error con credenciales incorrectas
    When ingresa el usuario "usuario_invalido" y hace clic en Login
    Then ve el mensaje "Usuario o contraseña incorrectos. Verifica tus datos e intenta nuevamente."
    And permanece en la pagina de login

  @regression
  Scenario: Mensaje de cuenta bloqueada para usuario bloqueado
    When ingresa el usuario "usuario_bloqueado" y hace clic en Login
    Then ve el mensaje "Tu cuenta ha sido bloqueada. Contacta al administrador para recuperar el acceso."
    And permanece en la pagina de login

  @regression
  Scenario: Mensaje de error cuando los campos estan vacios
    When hace clic en Login sin ingresar datos
    Then ve el mensaje "Por favor completa todos los campos."
    And permanece en la pagina de login
