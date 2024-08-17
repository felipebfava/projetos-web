const posts = async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    return response;
}

export {posts};