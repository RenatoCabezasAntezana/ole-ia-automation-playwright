@login
Feature: Login

  Como cliente de Sauce Demo,
  Quiero poder iniciar sesión con mis credenciales,
  Para acceder al catálogo de productos.

  Background:
    Given que el cliente se encuentra en la página de inicio de sesión

  @smoke
  Scenario: Acceso exitoso al catálogo
    When ingresa el usuario "standard_user" y la contraseña "secret_sauce"
    And hace clic en el botón de ingresar
    Then el sistema le permite el acceso y muestra la pantalla de productos en la url "/products"

  @regression
  Scenario: Rechazo por credenciales incorrectas
    When ingresa el usuario "standard_user" y una contraseña incorrecta "wrong_password"
    And hace clic en el botón de ingresar
    Then el sistema no le permite el acceso
    And muestra el mensaje de error "Epic sadface: Username and password do not match any user in this service"

  @regression
  Scenario: Rechazo por cuenta bloqueada
    When intenta ingresar con el usuario "locked_out_user" y la contraseña "secret_sauce"
    And hace clic en el botón de ingresar
    Then el sistema deniega el acceso
    And muestra el mensaje de error "Epic sadface: Sorry, this user has been locked out."
