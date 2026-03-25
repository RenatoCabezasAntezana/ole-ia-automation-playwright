@login
Feature: Login

  Como usuario del sistema,
  Quiero iniciar sesion con mis credenciales,
  Para acceder al dashboard de la aplicacion.

  @smoke
  Scenario: Login exitoso con credenciales validas
    Given que el usuario se encuentra en la pagina de inicio de sesion
    When ingresa el usuario "admin" y la contrasena "1234"
    And hace clic en el boton "Iniciar sesion"
    Then ve el mensaje "Inicio de sesion exitoso. Redirigiendo..."
    And es redirigido al dashboard en aproximadamente 1.2 segundos

  @regression
  Scenario: Mensaje de error por credenciales incorrectas
    Given que el usuario se encuentra en la pagina de inicio de sesion
    When ingresa el usuario "usuario_invalido" y la contrasena "clave_incorrecta"
    And hace clic en el boton "Iniciar sesion"
    Then ve el mensaje de error "Usuario o contraseña incorrectos. Verifica tus datos e intenta nuevamente."
    And permanece en la pagina de inicio de sesion

  @regression
  Scenario: Mensaje de bloqueo para cuenta bloqueada
    Given que el usuario se encuentra en la pagina de inicio de sesion
    When ingresa el usuario "bloqueado" y la contrasena "1234"
    And hace clic en el boton "Iniciar sesion"
    Then ve el mensaje de bloqueo "Tu cuenta ha sido bloqueada. Contacta al administrador para recuperar el acceso."
    And permanece en la pagina de inicio de sesion

  @regression
  Scenario: Mensaje de validacion por campos vacios
    Given que el usuario se encuentra en la pagina de inicio de sesion
    When hace clic en el boton "Iniciar sesion" sin completar ningun campo
    Then ve el mensaje de validacion "Por favor completa todos los campos."
    And permanece en la pagina de inicio de sesion

  @regression
  Scenario: Mensaje de validacion con solo el campo usuario vacio
    Given que el usuario se encuentra en la pagina de inicio de sesion
    When ingresa unicamente la contrasena "1234" dejando el campo usuario vacio
    And hace clic en el boton "Iniciar sesion"
    Then ve el mensaje de validacion "Por favor completa todos los campos."
    And permanece en la pagina de inicio de sesion

  @regression
  Scenario: Mensaje de validacion con solo el campo contrasena vacio
    Given que el usuario se encuentra en la pagina de inicio de sesion
    When ingresa unicamente el usuario "admin" dejando el campo contrasena vacio
    And hace clic en el boton "Iniciar sesion"
    Then ve el mensaje de validacion "Por favor completa todos los campos."
    And permanece en la pagina de inicio de sesion
