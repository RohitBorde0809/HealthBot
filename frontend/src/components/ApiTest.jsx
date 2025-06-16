import React, { useState } from 'react';
import chatService from '../services/chatService';
import drugInfoService from '../services/drugInfoService';
import translationService from '../services/translationService';

function ApiTest() {
    const [results, setResults] = useState({
        openai: null,
        openfda: null,
        translate: null
    });
    const [loading, setLoading] = useState({
        openai: false,
        openfda: false,
        translate: false
    });
    const [error, setError] = useState({
        openai: null,
        openfda: null,
        translate: null
    });

    const testOpenAI = async () => {
        setLoading(prev => ({ ...prev, openai: true }));
        setError(prev => ({ ...prev, openai: null }));
        try {
            const response = await chatService.getChatResponse([
                { role: "user", content: "Hello, are you working?" }
            ]);
            setResults(prev => ({ ...prev, openai: response }));
        } catch (err) {
            setError(prev => ({ ...prev, openai: err.message }));
        } finally {
            setLoading(prev => ({ ...prev, openai: false }));
        }
    };

    const testOpenFDA = async () => {
        setLoading(prev => ({ ...prev, openfda: true }));
        setError(prev => ({ ...prev, openfda: null }));
        try {
            const response = await drugInfoService.searchDrugs('aspirin');
            setResults(prev => ({ ...prev, openfda: response }));
        } catch (err) {
            setError(prev => ({ ...prev, openfda: err.message }));
        } finally {
            setLoading(prev => ({ ...prev, openfda: false }));
        }
    };

    const testTranslate = async () => {
        setLoading(prev => ({ ...prev, translate: true }));
        setError(prev => ({ ...prev, translate: null }));
        try {
            const response = await translationService.translateText('Hello', 'es');
            setResults(prev => ({ ...prev, translate: response }));
        } catch (err) {
            setError(prev => ({ ...prev, translate: err.message }));
        } finally {
            setLoading(prev => ({ ...prev, translate: false }));
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">API Test Panel</h2>
            
            <div className="space-y-4">
                {/* OpenAI Test */}
                <div className="border p-4 rounded">
                    <h3 className="text-xl font-semibold mb-2">OpenAI API Test</h3>
                    <button 
                        onClick={testOpenAI}
                        disabled={loading.openai}
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                    >
                        {loading.openai ? 'Testing...' : 'Test OpenAI'}
                    </button>
                    {error.openai && <p className="text-red-500 mt-2">{error.openai}</p>}
                    {results.openai && (
                        <pre className="mt-2 bg-gray-100 p-2 rounded">
                            {JSON.stringify(results.openai, null, 2)}
                        </pre>
                    )}
                </div>

                {/* OpenFDA Test */}
                <div className="border p-4 rounded">
                    <h3 className="text-xl font-semibold mb-2">OpenFDA API Test</h3>
                    <button 
                        onClick={testOpenFDA}
                        disabled={loading.openfda}
                        className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                    >
                        {loading.openfda ? 'Testing...' : 'Test OpenFDA'}
                    </button>
                    {error.openfda && <p className="text-red-500 mt-2">{error.openfda}</p>}
                    {results.openfda && (
                        <pre className="mt-2 bg-gray-100 p-2 rounded">
                            {JSON.stringify(results.openfda, null, 2)}
                        </pre>
                    )}
                </div>

                {/* Google Translate Test */}
                <div className="border p-4 rounded">
                    <h3 className="text-xl font-semibold mb-2">Google Translate API Test</h3>
                    <button 
                        onClick={testTranslate}
                        disabled={loading.translate}
                        className="bg-purple-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                    >
                        {loading.translate ? 'Testing...' : 'Test Translation'}
                    </button>
                    {error.translate && <p className="text-red-500 mt-2">{error.translate}</p>}
                    {results.translate && (
                        <pre className="mt-2 bg-gray-100 p-2 rounded">
                            {JSON.stringify(results.translate, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ApiTest; 