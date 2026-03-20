@login
Feature: Inicio de sesión en Swag Labs

  Como cliente de Swag Labs,
  Quiero poder iniciar sesión con mis credenciales,
  Para acceder al catálogo de productos.

  @smoke
  Scenario: Acceso exitoso al catálogo de productos
    Given que el cliente está en la página de inicio de sesión
    When ingresa el usuario "usuario_valido" y hace clic en Login
    Then el sistema lo redirige a "/inventory.html"
    And el cliente puede ver el catálogo de productos

  @regression
  Scenario: Intento de acceso con contraseña incorrecta
    Given que el cliente está en la página de inicio de sesión
    When ingresa el usuario "usuario_contrasena_errada" y hace clic en Login
    Then el sistema no permite el ingreso
    And muestra el mensaje de error "Epic sadface: Username and password do not match any user in this service"
    And el cliente permanece en la página de inicio de sesión

  @regression
  Scenario: Intento de acceso con cuenta bloqueada
    Given que el cliente está en la página de inicio de sesión
    When ingresa el usuario "usuario_bloqueado" y hace clic en Login
    Then el sistema deniega el acceso
    And muestra el mensaje de error "Epic sadface: Sorry, this user has been locked out."
    And el cliente permanece en la página de inicio de sesión
