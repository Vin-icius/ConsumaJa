using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PessoasApi.Models;
using PessoasApi.Services;

namespace PessoasApi.Controllers
{
    [ApiController]
    [Route("api/pessoa/[controller]/")]
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
            return View(pessoas);
        }

        [HttpGet("detalhes/{id}")]
        public IActionResult Detalhes(int id)
        {
            var pessoa = _pessoaService.ObterPorId(id);
            if (pessoa == null)
                return NotFound();

            return View(pessoa);
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
    }
}