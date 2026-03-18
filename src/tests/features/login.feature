@login
Feature: Login

  Como cliente de SauceDemo,
  Quiero poder iniciar sesion con mis credenciales,
  Para acceder al catalogo de productos.

  Background:
    Given que el cliente se encuentra en la pagina de inicio de sesion

  @smoke
  Scenario: Acceso exitoso al catalogo de productos
    When ingresa el usuario "standard_user" y la contrasena "secret_sauce"
    And hace clic en el boton de ingresar
    Then el sistema le permite el acceso y muestra la pantalla principal de productos con la url "/products"

  @regression
  Scenario: Rechazo de acceso con contrasena incorrecta
    When ingresa el usuario "standard_user" y una contrasena incorrecta "contrasena_incorrecta"
    And hace clic en el boton de ingresar
    Then el sistema no permite el ingreso
    And muestra el mensaje "Epic sadface: Username and password do not match any user in this service"

  @regression
  Scenario: Rechazo de acceso a cuenta bloqueada
    When ingresa el usuario "locked_out_user" y la contrasena "secret_sauce"
    And hace clic en el boton de ingresar
    Then el sistema deniega el acceso
    And muestra el mensaje "Epic sadface: Sorry, this user has been locked out."
