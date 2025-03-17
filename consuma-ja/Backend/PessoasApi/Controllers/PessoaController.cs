using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PessoasApi.Models;
using PessoasApi.Services;

namespace PessoasApi.Controllers
{
    [ApiController]
    [Route("api/[controller]/")]
    public class PessoaController : Controller
    {
        private readonly PessoaService _pessoaService;
        public PessoaController(PessoaService pessoaService)
        {
            _pessoaService = pessoaService;
        }

        [HttpGet("index/")]
        public IActionResult Index()
        {
            var pessoas = _pessoaService.ListarTodas();
            return Ok(pessoas); // Retorna a lista de pessoas como JSON
        }

        [HttpGet("detalhes/{id}")]
        public IActionResult Detalhes(int id)
        {
            var pessoa = _pessoaService.ObterPorId(id);
            if (pessoa == null)
                return NotFound();

            return Ok(pessoa); // Retorna como JSON no Swagger
        }


        [HttpGet("testar-conexao/")]
        public IActionResult TestarConexao()
        {
            var sucesso = _pessoaService.TestarConexao();
            if (sucesso)
                return Ok("Conexão com o banco estabelecida com sucesso.");
            else
                return StatusCode(500, "Erro ao conectar ao banco de dados.");
        }

        [HttpPost]
        public IActionResult Criar(Pessoa pessoa)
        {
            if (ModelState.IsValid)
            {
                _pessoaService.Adicionar(pessoa);
                return RedirectToAction("Index");
            }
            return View(pessoa);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            //usa padrão de senha ES512
            if (model == null || string.IsNullOrEmpty(model.Login) || string.IsNullOrEmpty(model.Senha))
                return BadRequest(new { message = "Login ou senha inválidos" });

            var token = _pessoaService.Autenticar(model);

            if (token == null)
                return Unauthorized(new { message = "Login ou senha incorretos" });

            return Ok(new { token });
        }

        [Authorize]
        [HttpGet("protegida")]
        public IActionResult RotaProtegida()
        {
            return Ok(new { message = "Você tem acesso autorizado!" });
        }
    }
}