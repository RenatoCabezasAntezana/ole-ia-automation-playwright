@login
Feature: Login

  Como cliente de Sauce Demo,
  Quiero iniciar sesión en la plataforma,
  Para acceder al catálogo de productos y realizar compras.

  Background:
    Given que el cliente se encuentra en la página de inicio de sesión

  @smoke
  Scenario: Acceso exitoso al catálogo
    When ingresa un nombre de usuario válido y su contraseña correcta
    Then el sistema le permite el ingreso y lo redirige a la url "/inventory.html"
    And se muestra el título "Products"

  @regression
  Scenario: Intento de acceso con datos incorrectos
    When ingresa un nombre de usuario registrado pero una contraseña equivocada
    Then muestra el mensaje "Epic sadface: Username and password do not match any user in this service"
    And el cliente permanece en la página de inicio de sesión

  @regression
  Scenario: Intento de acceso con cuenta restringida
    When intenta ingresar con un usuario que ha sido bloqueado por el administrador
    Then muestra el mensaje "Epic sadface: Sorry, this user has been locked out."
    And el cliente permanece en la página de inicio de sesión
