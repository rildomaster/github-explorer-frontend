import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';

import logoImg from '../../assets/logo.svg';
import { Title, Form, Repositories, Error } from './styles';

interface Repository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const [inputError, setInputError] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const json = localStorage.getItem('@GithubExplorer:repositories') || '[]';
    return JSON.parse(json);
  });

  useEffect(() => {
    localStorage.setItem(
      '@GithubExplorer:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  async function handleAddRepository(
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();

    try {
      if (!inputValue) {
        setInputError('Informe o nome/repositorio no GitHub.');
        return;
      }

      const repositoryExiste = repositories.find(
        (f) => f.full_name === inputValue,
      );
      if (repositoryExiste) {
        setInputError(`O repositório ${inputValue} já existe na lista.`);
        return;
      }

      const response = await api.get<Repository>(`repos/${inputValue}`);
      // const response = await api.get(`repos/${inputValue}`);
      const repository = response.data;
      // const repository = response.data as Repository;

      setRepositories([...repositories, repository]);
      setInputValue('');
      setInputError('');
    } catch (error) {
      setInputError('Repositório não encontrado.');
      // setInputError(`${error.message}`);
    }
  }

  return (
    <>
      <img src={logoImg} alt="Github Explorer" />
      <Title>Explore repositórios do Github</Title>

      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Nome do repositório"
        />
        <button type="submit">Pesquisar</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repositories>
        {repositories.map((repository) => (
          <Link
            key={repository.full_name}
            to={`/repositories/${repository.full_name}`}
          >
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
            />
            <div>
              <strong>{repository.full_name}</strong>
              <p>{repository.description}</p>
            </div>
            <FiChevronRight size={20} />
          </Link>
        ))}
      </Repositories>
    </>
  );
};

export default Dashboard;
