module User exposing (..)

import Json.Decode exposing (Decoder, nullable, string)
import Json.Decode.Pipeline exposing (required)


type alias User =
    { first_name : String
    , last_name : String
    , picture : Maybe String
    }


decoder : Decoder User
decoder =
    Json.Decode.succeed User
        |> required "first_name" string
        |> required "last_name" string
        |> required "picture" (nullable string)
