@login
Feature: Login en Swag Labs

  Como cliente de Swag Labs,
  Quiero poder iniciar sesión con mis credenciales,
  Para acceder al catálogo de productos.

  Background:
    Given que el cliente se encuentra en la página de inicio de sesión

  @smoke
  Scenario: Acceso exitoso al catálogo de productos
    When ingresa el nombre de usuario "standard_user" y la contraseña "secret_sauce"
    And hace clic en el botón de inicio de sesión
    Then el sistema le permite el ingreso y muestra la pantalla principal de productos
    And la URL de la página contiene "/products.html"

  @regression
  Scenario: Intento de acceso con contraseña incorrecta
    When ingresa el nombre de usuario "standard_user" y una contraseña incorrecta "wrong_password"
    And hace clic en el botón de inicio de sesión
    Then el sistema no permite el ingreso
    And se muestra el mensaje de error "Epic sadface: Username and password do not match any user in this service"
    And la URL permanece en la página de inicio de sesión

  @regression
  Scenario: Intento de acceso con cuenta bloqueada por el administrador
    When ingresa el nombre de usuario "locked_out_user" y la contraseña "secret_sauce"
    And hace clic en el botón de inicio de sesión
    Then el sistema deniega el acceso
    And se muestra el mensaje de error "Epic sadface: Sorry, this user has been locked out."
    And la URL permanece en la página de inicio de sesión
