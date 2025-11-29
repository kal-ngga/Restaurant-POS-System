/**
 * Contoh komponen yang bisa digunakan di berbagai halaman
 * 
 * Cara import di halaman:
 * import ExampleComponent from '@/Components/ExampleComponent'
 * 
 * Atau dengan relative path:
 * import ExampleComponent from '../Components/ExampleComponent'
 */

export default function ExampleComponent({ title, children }) {
    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            {children}
        </div>
    )
}

