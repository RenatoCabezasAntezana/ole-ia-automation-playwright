@login
Feature: Login

  Como cliente de SauceDemo,
  Quiero poder iniciar sesion con mis credenciales,
  Para acceder al catalogo de productos.

  Background:
    Given que el cliente se encuentra en la pagina de inicio de sesion

  @smoke
  Scenario: Acceso exitoso al catalogo de productos con credenciales validas
    When ingresa el nombre de usuario "standard_user" y la contrasena "secret_sauce"
    And hace clic en el boton de ingresar
    Then el sistema le permite el acceso y muestra la pantalla principal de productos
    And la URL de la pagina es "/products"

  @regression
  Scenario: Rechazo de acceso con contrasena incorrecta
    When ingresa el nombre de usuario "standard_user" y una contrasena incorrecta "wrong_password"
    And hace clic en el boton de ingresar
    Then el sistema no permite el acceso
    And muestra el mensaje de error "Epic sadface: Username and password do not match any user in this service"
    And el cliente permanece en la pagina de inicio de sesion

  @regression
  Scenario: Rechazo de acceso a cuenta bloqueada por el administrador
    When ingresa el nombre de usuario "locked_out_user" y la contrasena "secret_sauce"
    And hace clic en el boton de ingresar
    Then el sistema deniega el acceso
    And muestra el mensaje de error "Epic sadface: Sorry, this user has been locked out."
    And el cliente permanece en la pagina de inicio de sesion

  @regression
  Scenario: Intento de acceso sin ingresar ningun dato
    When hace clic en el boton de ingresar sin completar ningun campo
    Then el sistema no permite el acceso
    And muestra el mensaje de error "Epic sadface: Username is required"
    And el cliente permanece en la pagina de inicio de sesion

  @regression
  Scenario: Intento de acceso ingresando solo el nombre de usuario
    When ingresa el nombre de usuario "standard_user" y deja la contrasena en blanco
    And hace clic en el boton de ingresar
    Then el sistema no permite el acceso
    And muestra el mensaje de error "Epic sadface: Password is required"
    And el cliente permanece en la pagina de inicio de sesion
