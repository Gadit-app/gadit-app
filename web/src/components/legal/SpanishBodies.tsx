import type { ReactElement } from "react";

export function PrivacyBodyEs(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;nosotros&rdquo;, &ldquo;nos&rdquo; o &ldquo;nuestro&rdquo;) es un servicio
        operado por <strong>Lavi Learning and Training Technologies LLC</strong>, una empresa registrada en los Estados
        Unidos. Esta Política de Privacidad explica qué información recopilamos, cómo la utilizamos y qué opciones tiene
        usted.
      </p>
      <p>
        Si tiene alguna pregunta, escríbanos a{" "}
        <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>.
      </p>

      <h2>1. Información que recopilamos</h2>
      <h3>Información de la cuenta</h3>
      <p>
        Cuando usted crea una cuenta, recopilamos su dirección de correo electrónico y, si inicia sesión con Google, la
        información básica de perfil que Google proporciona (nombre de visualización, foto de perfil). No recibimos su
        contraseña de Google.
      </p>
      <h3>Información de uso</h3>
      <p>Cuando usted utiliza Gadit, procesamos:</p>
      <ul>
        <li>las palabras y las oraciones opcionales que usted consulta;</li>
        <li>las imágenes generadas a petición suya;</li>
        <li>su plan de suscripción y el estado de facturación;</li>
        <li>un historial reciente de búsquedas (para usuarios de pago, hasta las últimas 10 palabras), almacenado para que usted pueda consultarlo más adelante;</li>
        <li>cuotas mensuales (por ejemplo, la cantidad de imágenes que usted ha generado en el ciclo de facturación actual).</li>
      </ul>
      <h3>Datos técnicos y analíticos</h3>
      <p>
        Recopilamos automáticamente información técnica básica como la dirección IP, el tipo de navegador, el tipo de
        dispositivo, la URL de referencia y las páginas visitadas. Esto se utiliza para la seguridad, la supervisión del
        rendimiento y la analítica agregada. La analítica es proporcionada por Vercel y se anonimiza en el punto de
        recopilación (no se almacenan identificadores personales).
      </p>
      <h3>Información de pago</h3>
      <p>
        Si usted se suscribe, el pago es procesado por <strong>Stripe, Inc.</strong> No vemos ni almacenamos el número
        completo de su tarjeta; solo recibimos un token de cliente y los metadatos necesarios para identificar la
        suscripción.
      </p>

      <h2>2. Cómo utilizamos su información</h2>
      <ul>
        <li>para proporcionar y mejorar el servicio Gadit (generar definiciones, imágenes, comentarios sobre oraciones, cuestionarios);</li>
        <li>para mantener su cuenta y personalizar su experiencia (historial de búsqueda, idioma preferido, interruptor de Modo Niños);</li>
        <li>para procesar suscripciones y enviar correos electrónicos transaccionales (recibos, cambios de suscripción);</li>
        <li>para medir y mejorar el rendimiento del producto y prevenir el uso indebido;</li>
        <li>para cumplir con las obligaciones legales.</li>
      </ul>
      <p>
        <strong>No vendemos</strong> su información personal y no utilizamos su contenido para enviarle publicidad.
      </p>

      <h2>3. Servicios de terceros que utilizamos</h2>
      <p>
        Gadit se apoya en los siguientes proveedores de servicios. Cada uno de ellos recibe únicamente la información
        mínima necesaria para prestar el servicio correspondiente:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong> &mdash; procesa las palabras y oraciones que usted envía para generar definiciones,
          comentarios sobre oraciones, cuestionarios y transcripción de voz (Whisper), y genera imágenes (DALL·E 3). Los
          datos enviados a OpenAI se rigen por la política de uso de datos de la API de OpenAI.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage) &mdash; almacena su cuenta, perfil,
          estado de suscripción, historial de búsqueda e imágenes generadas.
        </li>
        <li>
          <strong>Stripe</strong> &mdash; gestiona los pagos, las suscripciones y el portal de facturación.
        </li>
        <li>
          <strong>Vercel</strong> &mdash; aloja y sirve el sitio web, y proporciona analítica anónima y medición del
          rendimiento.
        </li>
      </ul>

      <h2>4. Cuánto tiempo conservamos su información</h2>
      <ul>
        <li>Información de la cuenta: mientras exista su cuenta.</li>
        <li>Historial de búsqueda: las últimas 10 búsquedas por usuario, actualizado con cada nueva búsqueda.</li>
        <li>Imágenes generadas: se conservan para que una misma combinación palabra+significado pueda reutilizar la imagen en caché. Pueden conservarse indefinidamente mientras su cuenta esté activa.</li>
        <li>Registros de facturación e impuestos: según lo exija la ley aplicable (normalmente 7 años).</li>
        <li>Datos analíticos: agregados, normalmente conservados por el proveedor de analítica durante 13 meses.</li>
      </ul>

      <h2>5. Sus derechos</h2>
      <p>Según el lugar donde usted resida, puede tener derecho a:</p>
      <ul>
        <li>solicitar acceso a la información personal que tenemos sobre usted;</li>
        <li>solicitar la corrección de información inexacta;</li>
        <li>solicitar la eliminación de su cuenta y los datos asociados;</li>
        <li>exportar sus datos en un formato portátil;</li>
        <li>oponerse a determinados usos de su información o restringirlos;</li>
        <li>rechazar la divulgación de datos cuando corresponda según la CCPA o leyes similares.</li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, escriba a{" "}
        <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>. Le responderemos en un
        plazo de 30 días.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Utilizamos medidas de seguridad estándar del sector &mdash; conexiones cifradas (HTTPS), API autenticadas y
        controles de acceso &mdash; para proteger su información. Ningún método de transmisión o almacenamiento en
        internet es 100% seguro, por lo que no podemos garantizar una seguridad absoluta, pero trabajamos de forma
        continua para reducir los riesgos.
      </p>

      <h2>7. Menores</h2>
      <p>
        Gadit no está dirigido a menores de 13 años. Si usted cree que un menor de 13 años ha creado una cuenta,
        escríbanos y eliminaremos la cuenta y los datos asociados.
      </p>

      <h2>8. Usuarios internacionales</h2>
      <p>
        Gadit se opera desde los Estados Unidos. Si usted accede al servicio desde fuera de los Estados Unidos, su
        información será transferida, almacenada y procesada en los Estados Unidos y en las regiones de centros de datos
        utilizadas por nuestros proveedores de servicios.
      </p>

      <h2>9. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta Política de Privacidad de vez en cuando. Los cambios sustanciales se publicarán en esta
        página con una fecha de &ldquo;Última actualización&rdquo; revisada. El uso continuado de Gadit después de que
        los cambios entren en vigor constituye la aceptación de la política actualizada.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Correo electrónico:{" "}
        <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>
      </p>
    </>
  );
}

export function TermsBodyEs(): ReactElement {
  return (
    <>
      <p>
        Bienvenido a Gadit. Estos Términos de Uso (&ldquo;Términos&rdquo;) rigen su acceso y uso del sitio web, las
        aplicaciones y los servicios de Gadit (en conjunto, el &ldquo;Servicio&rdquo;), operados por{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;nosotros&rdquo;, &ldquo;nos&rdquo; o
        &ldquo;nuestro&rdquo;). Al utilizar el Servicio, usted acepta quedar vinculado por estos Términos. Si no está de
        acuerdo, no utilice el Servicio.
      </p>

      <h2>1. Quién puede utilizar Gadit</h2>
      <p>
        Usted debe tener al menos 13 años para crear una cuenta. Si tiene entre 13 y 18 años, debe contar con el permiso
        de un padre, madre o tutor legal. Al utilizar Gadit, usted declara que cumple con estos requisitos.
      </p>

      <h2>2. Su cuenta</h2>
      <p>
        Usted es responsable de mantener la confidencialidad de sus credenciales de inicio de sesión y de toda la
        actividad que ocurra bajo su cuenta. Notifíquenos de inmediato a{" "}
        <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a> si considera que su cuenta
        se ha visto comprometida.
      </p>

      <h2>3. Suscripciones y facturación</h2>
      <h3>Planes y tarifas</h3>
      <p>
        Gadit ofrece un plan Basic gratuito y planes de pago (Clear y Deep) con las funciones y precios indicados en la
        página de precios. Los precios se expresan en USD y pueden modificarse con un preaviso de al menos 30 días a los
        suscriptores existentes.
      </p>
      <h3>Renovación automática</h3>
      <p>
        Las suscripciones de pago se renuevan automáticamente al final de cada período de facturación (mensual o anual,
        según se haya seleccionado) al precio vigente en ese momento, a menos que se cancelen antes de la fecha de
        renovación.
      </p>
      <h3>Cancelación</h3>
      <p>
        Usted puede cancelar en cualquier momento desde la página de su cuenta. La cancelación detiene las renovaciones
        futuras. Mantendrá el acceso a las funciones de pago hasta el final del período de facturación en curso. No
        ofrecemos reembolsos parciales por el tiempo no utilizado.
      </p>
      <h3>Reembolsos</h3>
      <p>
        Salvo cuando la ley lo exija, los pagos no son reembolsables. Si considera que se le cobró por error,
        contáctenos en{" "}
        <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a> dentro de los 30 días
        siguientes al cargo.
      </p>

      <h2>4. Uso aceptable</h2>
      <p>Usted se compromete a no:</p>
      <ul>
        <li>utilizar el Servicio para ningún fin ilegal o en infracción de ninguna ley;</li>
        <li>intentar aplicar ingeniería inversa, descompilar o extraer el código fuente del Servicio;</li>
        <li>maltratar, acosar o perjudicar a otros usuarios, ni enviar contenido que sea odioso, amenazante u obsceno;</li>
        <li>automatizar el acceso al Servicio más allá de un uso personal razonable (por ejemplo, extraer definiciones a escala);</li>
        <li>eludir los límites de tasa o las restricciones del plan, ni utilizar varias cuentas para evitar las cuotas;</li>
        <li>utilizar el Servicio para entrenar o ajustar cualquier modelo de IA o producto de diccionario que compita;</li>
        <li>cargar o enviar contenido que no tenga derecho a enviar.</li>
      </ul>
      <p>
        Nos reservamos el derecho de suspender o cancelar las cuentas que infrinjan estos Términos.
      </p>

      <h2>5. Contenido generado por IA</h2>
      <p>
        Gadit utiliza modelos de inteligencia artificial (incluidos GPT, Whisper y DALL·E de OpenAI) para generar
        definiciones, ejemplos, etimologías, comentarios, cuestionarios, imágenes y transcripciones. Usted entiende y
        acepta que:
      </p>
      <ul>
        <li>
          El resultado de la IA puede ser <strong>inexacto, incompleto o inapropiado</strong>. Gadit está pensado como
          una herramienta de aprendizaje y no debe utilizarse como base para decisiones legales, médicas, profesionales
          o académicas.
        </li>
        <li>
          Las definiciones generadas por IA pueden diferir de los diccionarios oficiales. No garantizamos que cada
          definición sea lingüísticamente autorizada.
        </li>
        <li>
          Las imágenes se generan algorítmicamente y, en ocasiones, pueden resultar inesperadas o imprecisas. Son
          ilustraciones, no representaciones literales.
        </li>
        <li>
          Usted es el único responsable de cómo interpreta y utiliza el contenido generado por IA.
        </li>
      </ul>

      <h2>6. Su contenido</h2>
      <p>
        Cuando usted envía palabras, oraciones o audio a Gadit (por ejemplo, al utilizar &ldquo;Componga su propia
        oración&rdquo; o la entrada por voz), nos otorga una licencia mundial, no exclusiva y libre de regalías para
        procesar ese contenido con el fin de prestar y mejorar el Servicio. No reclamamos la propiedad de sus envíos.
      </p>

      <h2>7. Propiedad intelectual</h2>
      <p>
        El nombre Gadit, el logotipo, el sitio web y el software subyacente son de nuestra propiedad o de la propiedad
        de nuestros licenciantes. Se le concede una licencia personal, revocable y no exclusiva para utilizar el
        Servicio según lo permitido por estos Términos.
      </p>
      <p>
        El contenido generado por Gadit en respuesta a su entrada (definiciones, imágenes, etc.) puede ser utilizado por
        usted con fines personales, educativos o no comerciales. Para un uso comercial (por ejemplo, en un producto de
        pago), póngase en contacto con nosotros.
      </p>

      <h2>8. Disponibilidad y cambios</h2>
      <p>
        Nos esforzamos por mantener el Servicio disponible, pero no garantizamos un funcionamiento ininterrumpido ni
        libre de errores. Podemos modificar, suspender o interrumpir cualquier parte del Servicio en cualquier momento,
        incluidas las funciones, los precios o la disponibilidad en regiones específicas.
      </p>

      <h2>9. Servicios de terceros</h2>
      <p>
        El Servicio se apoya en proveedores externos (incluidos OpenAI, Google Firebase, Stripe y Vercel). Su
        disponibilidad o comportamiento pueden afectar su experiencia. Nuestra responsabilidad está limitada por la
        Sección 11, independientemente de los problemas causados por estos proveedores.
      </p>

      <h2>10. Exención de responsabilidad</h2>
      <p>
        EL SERVICIO SE PROPORCIONA &ldquo;TAL CUAL&rdquo; Y &ldquo;SEGÚN DISPONIBILIDAD&rdquo;, SIN GARANTÍAS DE NINGÚN
        TIPO, YA SEAN EXPRESAS O IMPLÍCITAS, INCLUIDAS, ENTRE OTRAS, LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA
        UN FIN DETERMINADO Y NO INFRACCIÓN.
      </p>

      <h2>11. Limitación de responsabilidad</h2>
      <p>
        EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC Y SUS DIRECTIVOS,
        EMPLEADOS Y AGENTES NO SERÁN RESPONSABLES DE NINGÚN DAÑO INDIRECTO, INCIDENTAL, ESPECIAL, CONSECUENTE O
        PUNITIVO, NI DE NINGUNA PÉRDIDA DE BENEFICIOS O INGRESOS, DERIVADOS DE O EN CONEXIÓN CON SU USO DEL SERVICIO.
      </p>
      <p>
        NUESTRA RESPONSABILIDAD TOTAL POR CUALQUIER RECLAMACIÓN DERIVADA DEL SERVICIO O RELACIONADA CON ÉL NO EXCEDERÁ
        LA MAYOR DE (A) LA CANTIDAD QUE USTED NOS HAYA PAGADO EN LOS DOCE MESES ANTERIORES A LA RECLAMACIÓN, O (B) USD
        $100.
      </p>

      <h2>12. Terminación</h2>
      <p>
        Usted puede dejar de utilizar el Servicio en cualquier momento. Podemos suspender o cancelar su acceso si
        infringe estos Términos o si la ley así lo exige. Tras la terminación, las disposiciones que por su naturaleza
        deban subsistir (incluidas las Secciones 7, 10, 11 y 14) permanecerán en vigor.
      </p>

      <h2>13. Cambios en estos Términos</h2>
      <p>
        Podemos revisar estos Términos de vez en cuando. Los cambios sustanciales se publicarán en esta página con una
        fecha de &ldquo;Última actualización&rdquo; revisada. El uso continuado del Servicio después de que los cambios
        entren en vigor constituye la aceptación de los Términos actualizados.
      </p>

      <h2>14. Ley aplicable y controversias</h2>
      <p>
        Estos Términos se rigen por las leyes del estado de Delaware, Estados Unidos, sin atender a sus normas sobre
        conflicto de leyes. Toda controversia derivada de o relacionada con estos Términos o con el Servicio se
        resolverá exclusivamente ante los tribunales estatales o federales ubicados en Delaware, Estados Unidos, y
        usted consiente la jurisdicción personal de dichos tribunales.
      </p>

      <h2>15. Contacto</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Correo electrónico:{" "}
        <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>
      </p>
    </>
  );
}
