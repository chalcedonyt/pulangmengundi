<?php
namespace App\TransferObjects;

class TransferObjectAbstract
{
    /**
     * Creates an instance of the TransferObject from an array.
     * @param array $data
     * @return TransferObject
     */
    public static function create( array $data )
    {
        $r = new \ReflectionClass( get_called_class() );
        $new = $r->newInstanceWithoutConstructor();

        foreach( $data as $key => $value ){
            if( $r->hasProperty($key)){
                $property = $r->getProperty($key);
                $property->setAccessible(true);
                $property->setValue($new, $value);
            }
        }
        return $new;
    }

    /**
     * Generic getter
     * @param String The property name
     * @return mixed
     */
    public function __get(string $property)
    {
        if( property_exists($this, $property)){
            return $this->$property;
        }
    }

    /**
     * Returns the array representation
     *
     * @return array
     */
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
