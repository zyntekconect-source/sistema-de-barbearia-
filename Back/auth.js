function handleCredentialResponse(response) {
    const token = response.credential;

    fetch('/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {

        console.log(data);

        if (data.success) {
            window.location.href = "/inicio.html";
        } else {
            alert("Falha na autenticação.");
        }

    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro ao conectar com o servidor.");
    });
}