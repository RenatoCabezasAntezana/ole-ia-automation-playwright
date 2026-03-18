@login
Feature: Login

  Como cliente de Swag Labs,
  Quiero poder iniciar sesion con mis credenciales,
  Para acceder al catalogo de productos.

  Background:
    Given que el cliente se encuentra en la pagina de inicio de sesion

  @smoke
  Scenario: Acceso exitoso al catalogo de productos
    When ingresa el usuario "standard_user" y la contrasena "secret_sauce"
    And hace clic en el boton de inicio de sesion
    Then el sistema debe permitir el ingreso
    And el cliente debe ver la pagina de productos en la url "/inventory.html"

  @regression
  Scenario: Intento de acceso con contrasena incorrecta
    When ingresa el usuario "standard_user" y una contrasena incorrecta "wrong_password"
    And hace clic en el boton de inicio de sesion
    Then el sistema no debe permitir el ingreso
    And el cliente debe ver el mensaje de error "Epic sadface: Username and password do not match any user in this service"
    And la pagina debe permanecer en la url de login

  @regression
  Scenario: Intento de acceso con cuenta bloqueada por el administrador
    When ingresa el usuario "locked_out_user" y la contrasena "secret_sauce"
    And hace clic en el boton de inicio de sesion
    Then el sistema debe denegar el acceso
    And el cliente debe ver el mensaje de error "Epic sadface: Sorry, this user has been locked out."
    And la pagina debe permanecer en la url de login
